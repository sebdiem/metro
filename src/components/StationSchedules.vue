<template>
  <div class="app">
    <LoadingBar v-show="!isReady"/>
    <Autocomplete
      v-show="isReady"
      :updateSuggestions="searchStation"
      placeholder="Rechercher une station"
      @focus="this.inputFocusChanged"
      @select="this.selectStation"
    />
    <div v-if="selectedStation">
      <h2>Station {{ selectedStation.name }}</h2>
      <div class="metro-lines">
        <template v-for="line in getStationLines(selectedStation)">
          <LineSchedule :line="line" :stationSlug="selectedStation.slug" class="metro-line"/>
        </template>
      </div>
    </div>
    <Overlay :visible="isSearching"/>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'

import Autocomplete from './Autocomplete.vue'
import LineSchedule from './LineSchedule.vue'
import LoadingBar from './LoadingBar.vue'
import Overlay from './Overlay.vue'

export default {
  name: 'station-schedules',
  components: {
    Autocomplete,
    LineSchedule,
    LoadingBar,
    Overlay,
  },
  data: function () {
    return {
      isReady: false,
      isSearching: false,
      selectedStation: null,
    }
  },
  computed: {
    scopeId: function () {
      // /!\ Danger, this can break anytime, not part of the public API
      return this.$options._scopeId
    },
    ...mapGetters([
      'getStationLines',
      'uniqueStations',
    ]),
  },
  created: async function () {
    await this.$store.dispatch('bootstrap')
    this.isReady = true
    Vue.nextTick(() => document.querySelector('.vue-autocomplete input').focus())
  },
  methods: {
    searchStation: function (expression) {
      const regex = new RegExp(expression, 'gi')
      return Promise.resolve(
        this.uniqueStations
        .filter(station => expression.length > 2 && station.name && station.name.match(regex))
        .map(station => {
          const match = station.name.match(regex)[0]
          const description = station.name.replace(match, `<span class="hl" ${this.scopeId}>${match}</span>`)
          return {description: description, slug: station.slug}
        })
      )
    },
    inputFocusChanged: function (focus) {
      this.isSearching = focus
    },
    selectStation: function (station) {
      this.selectedStation = this.uniqueStations.filter((s) => s.slug === station.slug)[0]
      this.isSearching = false
    },
  },
}
</script>

<style>
  * {
    box-sizing: border-box;
  }
</style>
<style scoped>
  .app {
    padding: 0 1em;
  }
  .hl {
    background: #ffd621;
  }
  .vue-autocomplete {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    z-index: 20;
    position: relative;
  }
  @media (min-width: 500px) {
    .vue-autocomplete {
      width: 500px;
    }
  }
  .metro-lines {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 100px;
  }
  .metro-line {
    width: 100%;
    flex: 0 0 auto;
    margin: 10px;
  }
  @media (min-width: 400px) {
    .metro-line {
      width: 400px;
    }
  }
</style>
