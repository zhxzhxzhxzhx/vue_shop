<template>
  <el-container class='Home-container'>
    <!-- 头部 -->
    <el-header>
      <div class='left-header'>
        <img src='../assets/heima.png' alt />
        电商后台管理系统
      </div>
      <el-button type='info' class='exit' @click='exit'>退出</el-button>
    </el-header>
    <!-- 主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width='AsideWidth+"px"'>
        <!-- 折叠筐 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 菜单 -->
        <el-menu background-color='#355777' text-color='#fff' active-text-color='#ffd04b' unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active = "activePath">
          <!-- 一级菜单 -->
          <el-submenu :index='item.id + ""' v-for='item in AsideList' :key='item.id'>
            <!-- 一级菜单模板 -->
            <template slot='title'>
              <i :class='IcoList[item.id]'></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index='"/"+subitem.path' v-for='subitem in item.children' :key='subitem.id'  @click="setSessionIndex">
              <template slot='title'>
                <i class='el-icon-menu'></i>
                <span>{{subitem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home-C',
  data () {
    return {
      // 侧边栏data
      AsideList: '',
      // 图标列表
      IcoList: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      // 侧边栏宽度
      AsideWidth: 250,
      // 被激活的链接地址
      activePath: ''
    }
  },
  created () {
    // 获取侧边栏数据列表
    this.getAsideList()
    // 刷新显示高亮
    this.activePath = window.sessionStorage.getItem('path')
  },
  methods: {
    // 退出
    exit () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取侧边栏数据
    async getAsideList () {
      const { data: re } = await this.$http.get('menus')
      if (re.meta.status !== 200) {
        return this.$message.error(re.meta.msg)
      }
      this.AsideList = re.data
    },
    // 控制侧边栏折叠
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
      if (this.isCollapse === true) {
        this.AsideWidth = 64
      } else {
        this.AsideWidth = 250
      }
    },
    // 存储点击的index
    setSessionIndex () {
      window.sessionStorage.setItem('path', this.$route.path)
      this.activePath = window.sessionStorage.getItem('path')
    }
  }
}
</script>

<style lang="less" scoped>
// .exit {
//   position: absolute;
//   top: 0;
//   right: 0;
// }
.el-header {
  background-color: #35363a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
}
.el-aside {
  background-color: #355777;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eee;
}
.Home-container {
  height: 100%;
}
.left-header {
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 20px;
  img {
    margin-right: 10px;
  }
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  width: 100%;
  background-color: #4a5064;
  text-align: center;
  line-height: 30px;
}
</style>
