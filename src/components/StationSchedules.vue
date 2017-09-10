<template>
  <div class="app">
    <ErrorMessage v-show="status === 'error'" :retryPeriod="retryPeriod" class="error-message">
      Oupppps ! Impossible de se connecter au serveur.<br/>
      Les données ne seront probablement pas très fraiches.</br>
    </ErrorMessage>
    <LoadingBar v-show="status === 'loading'"/>
    <Autocomplete
      v-show="status !== 'loading'"
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
import { mapGetters, mapState } from 'vuex'

import Autocomplete from './Autocomplete'
import ErrorMessage from './ErrorMessage'
import LineSchedule from './LineSchedule'
import LoadingBar from './LoadingBar'
import Overlay from './Overlay'

export default {
  name: 'station-schedules',
  components: {
    Autocomplete,
    ErrorMessage,
    LineSchedule,
    LoadingBar,
    Overlay,
  },
  data: function () {
    return {
      status: 'loading',  // one of loading, ready, error
      isSearching: false,
      selectedStation: null,
    }
  },
  computed: {
    scopeId: function () {
      // /!\ Danger, this can break anytime, not part of the public API
      return this.$options._scopeId
    },
    retryPeriod: function () {
      return 5  // seconds
    },
    ...mapState([
      'lines',
      'serverUp',
    ]),
    ...mapGetters([
      'getStationLines',
      'uniqueStations',
    ]),
  },
  created: function () {
    this.$store.watch((state) => state.serverUp, this.onServerStateChange)
    this.bootstrap()
  },
  methods: {
    bootstrap: async function () {
      await this.$store.dispatch('bootstrap')
      this.status = 'ready'
      Vue.nextTick(() => document.querySelector('.vue-autocomplete input').focus())
    },
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
    onServerStateChange: (function () {
      // interval is used in the callback, don't know why eslint is complaining
      let interval = null  // eslint-disable-line no-unused-vars

      return function () {
        if (!this.serverUp) {
          this.status = 'error'
          if (this.lines.length === 0 && interval == null) {
            interval = setInterval(this.bootstrap.bind(this), this.retryPeriod * 1000)
          }
        } else {
          if (interval != null) {
            clearInterval(interval)
          }
          if (this.lines.length > 0) {
            this.status = 'ready'
          }
        }
      }

    })(),
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
  .error-message {
    margin-bottom: 1em;
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
