<template>
  <div id="app">
    <StationSchedules></StationSchedules>
    <div class="credits">
      Thanks to <a href="https://github.com/pgrimaud">pgrimaud</a> for the <a href="https://github.com/pgrimaud/horaires-ratp-api">API</a>
    </div>
  </div>
</template>

<script>
import StationSchedules from './components/StationSchedules'

export default {
  name: 'app',
  components: {
    StationSchedules,
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
<style scoped>
  .credits {
    position: fixed;
    bottom: 1em;
    right: 1em;
  }
</style>
