<template>
  <!-- 登录组件 -->
  <div class="login-container">
    <div class="login-box">
      <!-- 图片区域 -->
      <div class="avator-box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 表单区域 -->
      <el-form :model="LoginFormData" :rules="LoginFormRules" ref="LoginFormRef" label-width="0" class="Login-form">
        <!-- 用户名 -->
        <el-form-item label=""  prop="username">
          <el-input v-model="LoginFormData.username" prefix-icon="iconfont icon-yonghu">
          </el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="" prop="password">
          <el-input v-model="LoginFormData.password" prefix-icon="iconfont icon-suoding" type="password"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login-c',
  data () {
    return {
      // 数据绑定
      LoginFormData: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证
      LoginFormRules: {
        // 用户名验证规则
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 密码验证规则
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetForm () {
      this.$refs.LoginFormRef.resetFields()
    },
    login () {
      this.$refs.LoginFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: re } = await this.$http.post('login', this.LoginFormData)
        if (re.meta.status !== 200) {
          return this.$message.error('抱歉, 登陆失败')
        }
        this.$message({
          message: '恭喜你, 登录成功!',
          type: 'success'
        })
        console.log(re.data.token)
        window.sessionStorage.setItem('token', re.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  min-width: 100%;
  min-height: 100%;
  background-color: #2b4b6b;
  .login-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    .avator-box {
      position: absolute;
      top: -60px;
      left: 50%;
      transform: translateX(-50%);
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      padding: 10px;
      border-radius: 50%;
      background-color: #eee;
      box-shadow: 0 0 10px #ddd;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
    .Login-form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
      .btns {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
