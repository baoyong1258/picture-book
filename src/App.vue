<template>
  <div id="app">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
  </div>
</template>

<style lang="scss">
html,body,#app {
  height: 100%;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
