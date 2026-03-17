<template>
  <component :is="layout">
      <router-view></router-view>
  </component>
</template>

<script>
const default_layout = "default";
export default {
  computed: {
    layout() {
      return (this.$route.meta.layout || default_layout) + "-layout";
    },
  },
};
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800;900&display=swap');

:root {
  --primary-font: 'Barlow', sans-serif;
  --heading-font: 'Barlow Condensed', sans-serif;
  --bg: #e0e0e0;
  --card-bg: #e0e0e0;
  --border: transparent;
}

body, html {
  background-color: var(--bg) !important;
  margin: 0;
  padding: 0;
}

#app {
  font-family: var(--primary-font);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg);
}

h1, h2, h3, h4, h5, h6, .display-font {
  font-family: var(--heading-font);
}
</style>