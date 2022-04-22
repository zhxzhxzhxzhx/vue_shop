<template>
  <div class='Home-container'>
    <el-button type='info' class='exit' @click='exit'>退出</el-button>
  </div>
</template>

<script>
export default {
  name: 'Home-C',
  methods: {
    exit () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
.exit {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
