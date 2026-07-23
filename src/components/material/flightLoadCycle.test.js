import { describe, expect, it } from 'vitest'
import {
  FLIGHT_ARM_DELAY_MS,
  FLIGHT_THRESHOLD_RESET,
  advanceFlightLoadCycle,
  beginFlightLoadCycle,
  createFlightLoadCycle,
  releaseFlightLoadCycle,
} from './flightLoadCycle'

describe('Limite press load cycle', () => {
  it('arms before loading and rises monotonically while held', () => {
    let cycle = beginFlightLoadCycle(createFlightLoadCycle())
    cycle = advanceFlightLoadCycle(cycle, 60)
    cycle = advanceFlightLoadCycle(cycle, FLIGHT_ARM_DELAY_MS - 80)
    expect(cycle).toMatchObject({ phase: 'arming', load: 0 })
    cycle = advanceFlightLoadCycle(cycle, 20)
    expect(cycle.phase).toBe('loading')
    const first = advanceFlightLoadCycle(cycle, 32)
    const second = advanceFlightLoadCycle(first, 32)
    expect(second.load).toBeGreaterThan(first.load)
    expect(second.peakLoad).toBe(second.load)
  })

  it('unloads monotonically to a stopped idle state', () => {
    let cycle = releaseFlightLoadCycle(createFlightLoadCycle(0.96))
    const first = advanceFlightLoadCycle(cycle, 64)
    const second = advanceFlightLoadCycle(first, 64)
    expect(first.load).toBeLessThan(0.96)
    expect(second.load).toBeLessThan(first.load)
    for (let index = 0; index < 20; index += 1) cycle = advanceFlightLoadCycle(cycle, 64)
    expect(cycle).toEqual(createFlightLoadCycle())
    expect(FLIGHT_THRESHOLD_RESET).toBeLessThan(0.94)
  })
})
