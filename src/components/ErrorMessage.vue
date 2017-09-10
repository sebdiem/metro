<template>
  <div>
    <slot></slot>
    Nouvel essai dans {{ (retryPeriod - (secondsCounter % (retryPeriod))) % retryPeriod }} secondes.
  </div>
</template>
<script>
export default {
  name: 'error-message',
  props: {
    retryPeriod: Number,  // seconds
  },
  data: function () {
    return {
      secondsCounter: 0,
      interval: null,
    }
  },
  created: function () {
    console.log('readdy')
    this.interval = setInterval(() => {
      this.secondsCounter += 1
    }, 1000)
  },
  destroyed: function () {
    clearInterval(this.interval)
  },
}
</script>
