<script>
  import Vue from 'vue'
  import autocomplete from 'vue-autocomplete'
  export default Vue.extend({
    mixins: [autocomplete],
  })
</script>
<style scoped>
  .vue-autocomplete * {
    box-sizing: border-box;
  }

  .user-input {
    font-size: 1rem;
    text-align: center;
    width: 100%;
    border: none;
    padding: 1em;
    margin: 0;
    background-color: white;
  }

  .user-input:focus {
    outline: none;
  }

  .results {
    padding: 0;
    width: 100%;
    background-color: white;
  }

  .results li {
    border-top: solid 1px #aaa;
    padding: 0.8em 1em;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .results ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  .active{
    background-color: #f5f9ff;
  }

  .link {
    text-decoration: none;
    color: inherit;
  }

  .credentials {
    font-size: 0.6em;
    text-align: right;
    cursor: auto;
  }
</style>
