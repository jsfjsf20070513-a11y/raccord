import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { expect, it } from 'vitest'

it('initializes an empty independent database without reviving retired tables or sharing personal rows', async () => {
  const db = new PGlite()
  const a = '11111111-1111-4111-8111-111111111111'
  const b = '22222222-2222-4222-8222-222222222222'
  const admin = '33333333-3333-4333-8333-333333333333'
  const init = await readFile(new URL('../../sql/initialize_independent_database.sql', import.meta.url), 'utf8')
  const asUser = async (id) => {
    await db.exec('reset role; set role authenticated;')
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id])
  }
  const forbidden = async (statement, params = []) => expect(db.query(statement, params)).rejects.toMatchObject({ code: '42501' })
  const submit = (kind) => `__mathclass_ops__::${JSON.stringify({ version: 1, kind, payload: { title: 'Fixture' } })}`
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key, raw_user_meta_data jsonb);
      create function auth.uid() returns uuid language sql stable as
        $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema public, auth to anon, authenticated;
      alter default privileges in schema public grant all on tables to public, anon, authenticated;
      create publication supabase_realtime;
    `)
    await db.exec(init)
    const tables = (await db.query("select tablename from pg_tables where schemaname='public' order by tablename")).rows.map((row) => row.tablename)
    expect(tables).toEqual(['ai_messages', 'comments', 'profiles', 'resources', 'review_states', 'testimonials'])
    for (const table of tables) {
      expect((await db.query(`select count(*)::int as count from public.${table}`)).rows[0].count).toBe(0)
      for (const role of ['anon', 'authenticated']) {
        for (const privilege of ['TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN']) {
          expect((await db.query('select has_table_privilege($1,$2,$3) as allowed', [role, `public.${table}`, privilege])).rows[0].allowed).toBe(false)
        }
      }
    }
    expect((await db.query("select tablename from pg_publication_tables where pubname='supabase_realtime'")).rows).toEqual([{ tablename: 'resources' }])
    for (const id of [a, b, admin]) await db.query('insert into auth.users values ($1,$2)', [id, { role: 'super_admin' }])
    expect((await db.query('select distinct role from public.profiles')).rows).toEqual([{ role: 'user' }])

    await db.exec('set role anon;')
    expect((await db.query('select * from public.resources')).rows).toEqual([])
    expect((await db.query('select * from public.testimonials')).rows).toEqual([])
    for (const table of ['profiles', 'review_states', 'ai_messages', 'comments']) await forbidden(`select * from public.${table}`)

    await asUser(a)
    await db.query('insert into public.review_states(user_id,word_id) values ($1,$2)', [a, 'same-word-id'])
    await db.query('insert into public.review_states(user_id,word_id,proficiency_level) values ($1,$2,2) on conflict(user_id,word_id) do update set proficiency_level=excluded.proficiency_level', [a, 'same-word-id'])
    await db.query("insert into public.ai_messages(user_id,role,content) values ($1,'user','fixture')", [a])
    await db.query('insert into public.comments(user_id,user_email,content) values ($1,$2,$3)', [a, 'fixture@example.invalid', submit('resource')])
    await forbidden('insert into public.comments(user_id,content) values ($1,$2)', [a, submit('moderation')])
    await forbidden('insert into public.comments(user_id,content) values ($1,$2)', [a, '__mathclass_ops__::{ "payload": {}, "kind" : "moderation" }'])
    await forbidden("update public.profiles set role='admin'")
    await forbidden("insert into public.resources(title) values ('must fail')")
    await forbidden("insert into public.testimonials(user_id,content) values ($1,'must fail')", [a])

    await asUser(b)
    for (const table of ['review_states', 'ai_messages', 'comments']) expect((await db.query(`select * from public.${table}`)).rows).toEqual([])
    expect((await db.query('select id from public.profiles')).rows).toEqual([{ id: b }])
    await forbidden('insert into public.review_states(user_id,word_id) values ($1,$2)', [a, 'must-fail'])
    expect((await db.query('delete from public.ai_messages returning id')).rows).toEqual([])
    expect((await db.query('delete from public.comments returning id')).rows).toEqual([])

    // Test-only administrator; registration itself never grants this role.
    await db.exec('reset role;')
    await db.query("update public.profiles set role='admin' where id=$1", [admin])
    await asUser(admin)
    expect((await db.query('select * from public.comments')).rows.length).toBe(1)
    await db.query('insert into public.comments(user_id,content) values ($1,$2)', [admin, submit('moderation')])
    await db.query("insert into public.resources(title,source_submission_id,published_by) values ('fixture book',1,$1) on conflict(source_submission_id) do update set title=excluded.title", [admin])
    expect((await db.query('delete from public.resources returning id')).rows.length).toBe(1)

    await asUser(a)
    expect((await db.query('select * from public.comments')).rows.length).toBe(1)
    expect((await db.query('delete from public.comments returning id')).rows.length).toBe(1)
    expect((await db.query('delete from public.ai_messages returning id')).rows.length).toBe(1)
    await db.exec('reset role;')
    await expect(db.exec(init)).rejects.toThrow('目标库已有应用表')
    await db.exec('rollback;')
    expect((await db.query('select count(*)::int as count from public.profiles')).rows[0].count).toBe(3)
  } finally { await db.close() }
}, 30000)
