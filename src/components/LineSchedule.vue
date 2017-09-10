<template>
  <div class="container">
    <template v-if="ready">
      <div class="header">
        <h3 class="header-title">{{ line.name }}</h3>
      </div>
      <p class="traffic" v-if="line.traffic">{{ line.traffic.title }}</p>
      <div class="body">
        <div class="schedules">
          <div class="direction">Direction {{ scheduleA.destination }}</div>
          <div class="time-remaining">{{ scheduleA.message }}</div>
        </div>
        <div class="schedules">
          <div class="direction">Direction {{ scheduleR.destination }}</div>
          <div class="time-remaining">{{ scheduleR.message }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'line-schedule',
  props: {
    line: null,
    stationSlug: null,
  },
  data: function () {
    return {
      ready: false,
      interval: null,
    }
  },
  computed: {
    station: function () {
      return this.getStation(this.line, this.stationSlug)
    },
    scheduleA: function () {
      return this._schedule('A')
    },
    scheduleR: function () {
      return this._schedule('R')
    },
    ...mapState([
      'lines',
    ]),
    ...mapGetters([
      'getLine',
      'getStation',
      'stations',
      'uniqueStations',
    ]),
  },
  created: async function () {
    await this.$store.dispatch('loadSchedules', {line: this.line, station: this.stationSlug})
    this.interval = setInterval(() => {
      this.$store.dispatch('loadSchedules', {line: this.line, station: this.stationSlug})
    }, 15000)
    this.ready = true
  },
  destroyed: function () {
    clearInterval(this.interval)
  },
  methods: {
    _schedule: function (way) {
      const sched = this.station.schedules[way][0]
      return {
        destination: sched.destination,
        // message can contain "Train à l'approche" or "Train à quai" transform into "0 mn"
        message: sched.message.length > 5 ? '0 mn' : sched.message,
      }
    },
  },
  watch: {
    station: async function (val, oldVal) {
      this.ready = false
      await this.$store.dispatch('loadSchedules', {line: this.line, station: val})
      this.ready = true
    },
  },
}
</script>

<style scoped>
  .container {
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    transition: 0.3s;
  }
  .container:hover {
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
  }
  .header {
    background: rgba(0, 0, 0, 0.15);
    padding: 0.5em;
  }
  .header-title {
    margin: 0;
  }
  .traffic {
    margin: 0;
    padding: 0.2em;
    border-bottom: 1px dashed;
  }
  .direction {
    flex: 1 1 auto;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 1em;
  }
  .schedules {
    display: flex;
    align-items: center;
    padding-top: 1em;
    padding-right: 1em;
    padding-left: 1em;
  }
  .schedules:last-child {
    padding-bottom: 1em;
  }
  .time-remaining {
    flex: 0 0 4em;
    background: #ffd621;
    padding: 0.4em;
    font-weight: bold;
    color: white;
  }
</style>
