<template>
  <div class="overlay" v-show="show"></div>
</template>

<script>

export default {
  name: 'overlay',
  props: {
    visible: false,
  },
  data: function () {
    return {
      show: this.visible,  // not reactive
    }
  },
  watch: {
    visible: function (val, oldVal) {
      if (val) {
        this.show = true
        setTimeout(() => {
          this.$el.classList.add('visible')
        }, 20)
      } else {
        this.$el.addEventListener('transitionend', (e) => { this.show = false }, {once: true})
        this.$el.classList.remove('visible')
      }
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .overlay {
    background: rgba(0, 0, 0, 0.85);
    z-index: 10;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    opacity: 0;
    transition: opacity 0.4s ease-in-out;
  }
  .visible {
    opacity: 100;
    z-index: 10;
  }
</style>

