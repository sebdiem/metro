import Vue from 'vue'
import Vuex from 'vuex'

import * as service from './service'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    lines: [],
    serverUp: true,
  },
  getters: {
    getLine: (state, getters) => (lineCode) => {
      lineCode = lineCode && lineCode.toLowerCase()
      if (lineCode != null) {
        return state.lines.filter((line) => line.code.toLowerCase() === lineCode)[0]
      }
    },
    getStation: (state, getters) => (line, station) => {
      if (line.code == null) {
        line = getters.getLine(line)
      }
      if (line != null) {
        return line.stations.filter((s) => s.slug === station)[0]
      }
    },
    getStationLines: (state, getters) => (stationSlug) => {
      stationSlug = stationSlug.slug || stationSlug
      return getters.stations
        .filter((station) => station.slug === stationSlug)
        .map((station) => getters.getLine(station.line))
    },
    stations: (state, getters) => {
      return state.lines
        .map(line => line.stations)
        // flatten the array of array
        .reduce((curr, el) => curr.concat(el), [])
    },
    uniqueStations: (state, getters) => {
      const seen = new Set()
      return getters.stations
        .filter((station) => {
          if (seen.has(station.slug)) {
            return false
          } else {
            seen.add(station.slug)
            return true
          }
        })
    },
  },
  mutations: {
    updateServerState (state, status) {
      state.serverUp = status
    },
    updateLines (state, lines) {
      state.lines = state.lines.splice().concat(lines)
    },
    updateStations (state, payload) {
      const line = payload.line
      if (line != null) {
        line.stations = payload.stations
      } else {
        console.log('trying to update unknown line')
      }
    },
    updateTraffic (state, payload) {
      const line = payload.line
      line.traffic = payload.traffic
    },
    updateSchedules (state, payload) {
      Vue.set(payload.station, 'schedules', payload.schedules)
    },
  },
  actions: {
    async bootstrap (context) {
      await context.dispatch('loadLines')
      context.dispatch('loadTraffic')
      context.state.lines.forEach((line) => context.dispatch('loadStations', line.code))
    },
    async loadLines (context) {
      const lines = await service.getLines()
      context.commit('updateLines', lines)
    },
    async loadStations (context, lineCode) {
      const stations = await service.getStations(lineCode)
      context.commit('updateStations', {line: context.getters.getLine(lineCode), stations: stations})
    },
    async loadTraffic (context) {
      const traffic = await service.getTraffic()
      traffic.forEach((t) => {
        context.commit('updateTraffic', {line: context.getters.getLine(t.line), traffic: t})
      })
    },
    async loadSchedules (context, payload) {
      let line = payload.line
      if (line.code == null) {
        line = context.getters.getLine(line)
      }
      let station = payload.station
      if (station.slug == null) {
        station = context.getters.getStation(line, station)
      }

      if (station == null) {
        console.log('Unknown station %s for line %s', payload.station, line.code)
        return
      }

      const schedules = await service.getSchedules(line.code, station.slug)
      context.commit('updateSchedules', {station, schedules})
    },
  },
})

export default store
