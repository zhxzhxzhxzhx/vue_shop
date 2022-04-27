/* eslint-disable vue/no-unused-vars */
<template>
  <div class='Users container'>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class='el-icon-arrow-right'>
      <el-breadcrumb-item :to='{ path: "/home" }'>首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class='box-card'>
      <!-- 输入框 -->
      <el-row :gutter='20'>
        <el-col :span='7'>
          <el-input
            placeholder='请输入内容'
            v-model='requestInfo.query'
            :disabled='false'
            :clearable='true'
            @clear='getUserList()'
          >
            <el-button slot='append' icon='el-icon-search' @click='getUserList()'></el-button>
          </el-input>
        </el-col>
        <el-col :span='4'>
          <el-button type='success' round @click='dialogVisible = true'>添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data='userList' border style='width: 100%"'>
        <el-table-column type='index' label='#'></el-table-column>
        <el-table-column prop='username' label='姓名' width='200'></el-table-column>
        <el-table-column prop='email' label='邮箱'></el-table-column>
        <el-table-column prop='mobile' label='电话'></el-table-column>
        <el-table-column prop='role_name' label='角色'></el-table-column>
        <el-table-column prop='mg_state' label='状态'>
          <template slot-scope='scope'>
            <el-switch
              v-model='scope.row.mg_state'
              active-color='#13ce66'
              inactive-color='#ff4949'
              @change='userStateChange(scope.row)'
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label='操作'>
          <template slot-scope='scope'>
            <el-button type='primary' icon='el-icon-edit' circle size='mini' @click='showEditDialog(scope.row.id)'></el-button>
            <el-button type='danger' icon='el-icon-delete' circle size='mini' @click="removeUsers(scope.row.id)"></el-button>
            <el-tooltip class='item' effect='dark' content='权限' placement='top-start' :enterable='false'>
              <el-button type='warning' icon='el-icon-setting' circle size='mini'></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change='handleSizeChange'
        @current-change='handleCurrentChange'
        :current-page='requestInfo.pagenum'
        :page-sizes='[1, 2, 5, 10]'
        :page-size='requestInfo.pagesize'
        layout='total, sizes, prev, pager, next, jumper'
        :total='total'
      ></el-pagination>
      <!-- 添加用户提示框 -->
      <el-dialog
        title='添加用户'
        :visible.sync='dialogVisible'
        width='30%'
        :before-close='handleClose'
        @close='resetaddform'
      >
        <!-- 添加用户表单 -->
        <el-form ref='addformref' :model='addform' :rules='addformrules' label-width='60px'>
          <el-form-item label='姓名' prop='username'>
            <el-input v-model='addform.username'></el-input>
          </el-form-item>
          <el-form-item label='密码' prop='password'>
            <el-input v-model='addform.password'></el-input>
          </el-form-item>
          <el-form-item label='邮箱' prop='email'>
            <el-input v-model='addform.email'></el-input>
          </el-form-item>
          <el-form-item label='手机' prop='mobile'>
            <el-input v-model='addform.mobile'></el-input>
          </el-form-item>
        </el-form>
        <span slot='footer' class='dialog-footer'>
          <el-button @click='dialogVisible = false'>取 消</el-button>
          <el-button type='primary' @click='confirmform'>确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户提示框 -->
      <el-dialog title='修改用户数据' :visible.sync='editDialog' width='30%' @close="resetEditform">
        <span>
          <el-form ref='editformref' :model='editForm' :rules="editFormrules" label-width='80px'>
            <el-form-item label='用户名'>
              <el-input v-model='editForm.username' disabled></el-input>
            </el-form-item>
            <el-form-item label='邮箱' prop="email">
              <el-input v-model='editForm.email'></el-input>
            </el-form-item>
            <el-form-item label='手机'>
              <el-input v-model='editForm.mobile'></el-input>
            </el-form-item>
          </el-form>
        </span>
        <span slot='footer' class='dialog-footer'>
          <el-button @click='editDialog = false'>取 消</el-button>
          <el-button type='primary' @click='confirmEditForm'>确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Users-C',
  data () {
    // 邮箱验证
    const checkEmail = (rule, value, callback) => {
      // eslint-disable-next-line no-useless-escape
      const reg = /^\w+@[\da-z\.-]+\.([a-z]{2,6}|[\u2E80-\u9FFF]{2,3})$/
      if (reg.test(value)) {
        return callback()
      }
      callback(new Error('输入邮箱格式错误'))
    }
    // 手机号验证
    const checkPhone = (rule, value, callback) => {
      const reg =
        /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
      if (reg.test(value)) {
        return callback()
      }
      callback(new Error('输入手机号格式错误'))
    }
    return {
      // 用户数据列表  // 表格数据
      userList: '',
      // 请求参数
      requestInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 总数
      total: 0,
      // 添加用户提示框显示
      dialogVisible: false,
      // 添加用户表单数据
      addform: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单规则
      addformrules: {
        username: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 3,
            max: 15,
            message: '长度在 3 到 15 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      // 修改用户数据表单规则
      editFormrules: {
        username: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      // 修改用户数据表单显示与隐藏
      editDialog: false,
      // 修改用户数据表单
      editForm: {}
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取用户列表
    async getUserList () {
      const { data: re } = await this.$http.get('users', {
        params: this.requestInfo
      })
      if (re.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = re.data.users
      this.total = re.data.total
      console.log(re)
    },
    // 分页大小变化
    handleSizeChange (newSize) {
      this.requestInfo.pagesize = newSize
      this.getUserList()
    },
    // 分页页数变化
    handleCurrentChange (newPage) {
      this.requestInfo.pagenum = newPage
      this.getUserList()
    },
    // 提交用户状态
    async userStateChange (newState) {
      const { data: re } = await this.$http.put(
        `users/${newState.id}/state/${newState.mg_state}`
      )
      if (re.meta.status !== 200) {
        newState.mg_state = !newState.mg_state
        return this.$message.error('提交用户状态失败')
      }
      this.$message.success('更新用户状态成攻')
      this.getUserList()
    },
    // 添加用户确认取消提示
    handleClose (done) {
      this.$confirm('确认关闭？')
        .then((_) => {
          done()
        })
        .catch((_) => {})
    },
    // 重置添加用户表单
    resetaddform () {
      this.$refs.addformref.resetFields()
    },
    // 添加用户表单确认
    confirmform () {
      this.$refs.addformref.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('表单验证失败')
        }
        const { data: re } = await this.$http.post('users', this.addform)
        if (re.meta.status !== 201) {
          this.$message.error('添加用户失败')
        } else {
          this.$message.success('添加用户成功')
          this.getUserList()
          this.dialogVisible = false
        }
      })
    },
    // 显示修改用户提示框
    async showEditDialog (id) {
      this.editDialog = true
      const { data: re } = await this.$http.get('users/' + id)
      if (re.meta.status !== 200) {
        this.$message.error('查询用户信息失败')
      } else {
        this.$message.success('查询用户信息成功')
        this.editForm = re.data
      }
    },
    // 确认提交修改用户数据的表单
    confirmEditForm () {
      this.editDialog = false
      this.$refs.editformref.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('表单验证失败')
        }
        const { data: re } = await this.$http.put('users/' + this.editForm.id, this.editForm)
        if (re.meta.status !== 200) {
          this.$message.error('修改用户信息失败')
        } else {
          this.$message.success('修改用户信息成功')
          this.getUserList()
        }
      })
    },
    // 关闭表单时,重置修改用户数据表单
    resetEditform () {
      this.$refs.editformref.resetFields()
    },
    // 删除用户
    async removeUsers (id) {
      console.log(id)
      const confirmresult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmresult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const { data: re } = await this.$http.delete('users/' + id)
      if (re.meta.status !== 200) {
        this.$message.error('删除用户信息失败')
      } else {
        this.$message.success('删除用户信息成功')
        this.getUserList()
      }
    }
  }
}
</script>

<style lang="less">
.el-breadcrumb {
  margin-bottom: 20px;
  font-size: 12px;
  letter-spacing: 0.2em;
}
.el-card {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  .el-row {
    margin-bottom: 30px;
  }
  .el-table {
    font-size: 12px;
  }
  .el-pagination {
    margin-top: 20px;
  }
}
</style>
>
