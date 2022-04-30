<template>
  <div class='Roles-container'>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class='el-icon-arrow-right'>
      <el-breadcrumb-item :to='{ path: "/home" }'>首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class='box-card'>
      <!-- 添加角色按钮 -->
      <el-button type='primary' class='btnmargin' @click='addRole'>添加角色</el-button>
      <!-- 表格 -->
      <el-table :data='rolesList' border stripe style='width: 100%'>
        <!-- 展开列 -->
        <el-table-column type='expand'>
          <template slot-scope='scope'>
            <el-row
              :class="['bdbottom',index===0 ? 'bdtop' : '','flexcenter']"
              v-for='(item,index) in scope.row.children'
              :key='item.id'
              class='elrowpad'
            >
              <!-- 渲染一级权限 -->
              <el-col :span='5'>
                <el-tag @close='closeById(scope.row,item.id)' closable>{{item.authName}}</el-tag>
                <i class='el-icon-caret-right'></i>
              </el-col>
              <!-- 渲染二级权限和三级权限 -->
              <el-col :span='19'>
                <el-row
                  v-for='(item2,index2) in item.children'
                  :key='item2.id'
                  :class="[index2===0 ? '' : 'bdtop', 'flexcenter']"
                >
                  <!-- 二级权限 -->
                  <el-col :span='6'>
                    <el-tag type='success' @close='closeById(scope.row,item2.id)' closable>{{item2.authName}}</el-tag>
                    <i class='el-icon-caret-right'></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span='18'>
                    <el-tag
                      type='warning'
                      closable
                      v-for='(item3) in item2.children'
                      :key='item3.id'
                      @close='closeById(scope.row,item3.id)'
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{scope.row}}
            </pre>-->
          </template>
        </el-table-column>
        <el-table-column type='index' label='#'></el-table-column>
        <el-table-column prop='roleName' label='角色名称'></el-table-column>
        <el-table-column prop='roleDesc' label='角色描述'></el-table-column>
        <el-table-column label='操作'>
          <template slot-scope='scope'>
            <el-button type='primary' icon='el-icon-edit' size='mini' @click='editRole(scope.row.id)'>编辑</el-button>
            <el-button type='danger' icon='el-icon-delete' size='mini' @click='deleteRole(scope.row.id)'>删除</el-button>
            <el-tooltip class='item' effect='dark' content='权限' placement='top-start' :enterable='false'>
              <el-button type='warning' icon='el-icon-setting' size='mini' @click='showSetRightDiaLog(scope.row)'>分配权限</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色提示框 -->
      <el-dialog title='添加角色' :visible.sync='addRoleDialogVisible' width='30%'>
        <!-- 添加角色表单 -->
        <el-form ref='addRoleFormRef' :model='addRoleForm' label-width='80px'>
          <el-form-item label='角色名称'>
            <el-input v-model='addRoleForm.roleName'></el-input>
          </el-form-item>
          <el-form-item label='角色描述'>
            <el-input v-model='addRoleForm.roleDesc'></el-input>
          </el-form-item>
        </el-form>
        <span slot='footer' class='dialog-footer'>
          <el-button @click='cancelAddForm'>取 消</el-button>
          <el-button type='primary' @click='confirmAddRoleForm'>确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑角色提示框 -->
      <el-dialog title='修改角色' :visible.sync='EditRoleDialogVisible' width='30%'>
        <!-- 修改角色表单 -->
        <el-form ref='editRoleFormRef' :model='editRoleForm' label-width='80px'>
          <el-form-item label='角色名称'>
            <el-input v-model='editRoleForm.roleName'></el-input>
          </el-form-item>
          <el-form-item label='角色描述'>
            <el-input v-model='editRoleForm.roleDesc'></el-input>
          </el-form-item>
        </el-form>
        <span slot='footer' class='dialog-footer'>
          <el-button @click='cancelEditForm'>取 消</el-button>
          <el-button type='primary' @click='confirmEditRoleForm'>确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限提示框 -->
      <el-dialog title='分配权限' :visible.sync='SetRightDialogVisible' width='30%' @close="setRightDialogClose">
        <!-- 分配权限树 -->
        <!-- <el-form ref='SetRightFormRef' :model='SetRightForm' label-width='80px'> -->
          <el-tree
            :data='SetRightList'
            :props='treeProps'
            show-checkbox
            node-key='id'
            default-expand-all
            :default-checked-keys='defKeys'
            ref="treeRef"
          ></el-tree>
        <!-- </el-form> -->
        <span slot='footer' class='dialog-footer'>
          <el-button @click='cancelSetRight'>取 消</el-button>
          <el-button type='primary' @click='confirmSetRightForm'>确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Roles-C',
  data () {
    return {
      // 获取的角色信息列表
      rolesList: '',
      // 添加表单
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改表单
      editRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      addRoleDialogVisible: false,
      EditRoleDialogVisible: false,
      editId: '',
      // SetRightForm: {},
      SetRightDialogVisible: false,
      // 获取到的分配权限名称
      SetRightList: {},
      // 树形控件
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点id数组
      defKeys: [],
      roleId: 0
    }
  },
  created () {
    this.getrolesList()
  },
  methods: {
    // 获取角色列表
    async getrolesList () {
      const { data: re } = await this.$http.get('roles')
      if (re.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = re.data
    },
    // 添加角色按钮
    addRole () {
      this.addRoleDialogVisible = true
    },
    // 确认提交添加角色表单
    async confirmAddRoleForm () {
      this.addRoleDialogVisible = false
      const { data: re } = await this.$http.post('roles', this.addRoleForm)
      if (re.meta.status !== 201) {
        return this.$message.error('添加角色失败')
      }
      this.getrolesList()
      this.addRoleForm.roleName = ''
      this.addRoleForm.roleDesc = ''
    },
    // 取消添加角色表单
    cancelAddForm () {
      this.addRoleDialogVisible = false
      this.addRoleForm.roleName = ''
      this.addRoleForm.roleDesc = ''
    },
    // 修改角色通过ID查询到角色ID
    async editRole (id) {
      this.EditRoleDialogVisible = true
      const { data: re } = await this.$http.get('roles/' + id)
      if (re.meta.status !== 200) {
        return this.$message.error('修改角色失败')
      }
      this.editId = re.data.roleId
      console.log(this.editId)
    },
    // 取消修改角色表单
    cancelEditForm () {
      this.EditRoleDialogVisible = false
      this.editRoleForm = {}
    },
    // 取消修改角色表单
    async confirmEditRoleForm () {
      this.EditRoleDialogVisible = false

      const { data: re } = await this.$http.put(
        'roles/' + this.editId,
        this.editRoleForm
      )
      if (re.meta.status !== 200) {
        return this.$message.error('修改角色失败')
      }
      this.editRoleForm = {}
      this.getrolesList()
    },
    // 删除角色
    async deleteRole (id) {
      const confirmresult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (confirmresult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const { data: re } = await this.$http.delete('roles/' + id)
      if (re.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.getrolesList()
    },
    // 根据Id删除用户权限
    async closeById (role, rightId) {
      const confirmresult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (confirmresult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const { data: re } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (re.meta.status !== 200) {
        return this.$message.error('删除用户权限失败')
      }
      // this.getrolesList() 会刷新占整个页面
      role.children = re.data
    },
    // 展示分配权限提示框
    async showSetRightDiaLog (role) {
      const { data: re } = await this.$http.get('rights/tree')
      if (re.meta.status !== 200) {
        return this.$message.error('获取权限信息失败')
      }
      this.roleId = role.id
      this.SetRightList = re.data
      this.getLeafKeys(role, this.defKeys)
      // console.log(re.data)
      this.SetRightDialogVisible = true
    },
    // 取消分配权限表单
    cancelSetRight () {
      this.SetRightDialogVisible = false
    },
    // 确认并提交分配权限表单
    async confirmSetRightForm () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      const idStr = keys.join(',')
      // console.log(idStr)
      console.log(this.roleId)
      const { data: re } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (re.meta.status !== 200) {
        return this.$message.error('更新权限信息失败')
      }
      // console.log(re.meta.status)
      this.$message.success('分配权限成功')
      this.getrolesList()
      this.SetRightDialogVisible = false
    },
    // 递归获取三级权限ID
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 关闭分配权限对话框时，重置数组
    setRightDialogClose () {
      this.defKeys = []
    }
  }
}
</script>

<style lang="less" scoped>
.btnmargin {
  margin-bottom: 23px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.elrowpad {
  margin: 0 100px !important;
}
.el-row {
  margin: 0;
  .el-tag {
    margin: 10px 0;
    margin-right: 8px;
  }
}
/deep/ .el-table__expanded-cell {
  padding: 0 !important;
}
.flexcenter {
  display: flex;
  align-items: center;
}
</style>
