<template>
  <div class='params-container'>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class='el-icon-arrow-right'>
      <el-breadcrumb-item :to='{ path: "/home" }'>首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert title='注意: 只允许为第三级分类设置相关参数' type='warning' show-icon :closable='false'></el-alert>
      <!-- 选择商品分类 -->
      <el-row>
        <el-col>
          <span>选择商品分类</span>
          <!-- 级联选择框 -->
          <el-cascader
            v-model='selectList'
            :options='cateList'
            :props='cascaderprops'
            clearable
            @change='cashandleChange'
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- Tab -->
      <el-tabs v-model='activeName' @tab-click='tabhandleClick'>
        <!-- 添加动态参数面板 -->
        <el-tab-pane label='动态参数' name='many'>
          <el-button type='primary' size='small' :disabled='isbtn' @click='addParam'>添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data='manyData' border stripe>
            <!-- 折叠栏 -->
            <el-table-column type='expand'>
              <template slot-scope='scope'>
                <!-- 循环渲染tag -->
                <el-tag closable v-for='(item,index) in scope.row.attr_vals' :key='index' @close="closeTag(index,scope.row)">{{item}}</el-tag>
                <!-- new Tag -->
                <!-- 文本框 -->
                <el-input
                  class='input-new-tag'
                  v-if='scope.row.inputVisible'
                  v-model='scope.row.inputValue'
                  ref='saveTagInput'
                  size='small'
                  @keyup.enter.native='handleInputConfirm(scope.row)'
                  @blur='handleInputConfirm(scope.row)'
                ></el-input>
                <!-- 按钮 -->
                <el-button v-else class='button-new-tag' size='small' @click='showInput(scope.row)'>+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type='index' label='#'></el-table-column>
            <el-table-column label='参数名称' prop='attr_name'></el-table-column>
            <el-table-column label='操作'>
              <template slot-scope='scope'>
                <el-button type='primary' icon='el-icon-edit' size='mini' @click='showeditDialog(scope.row.attr_id)'>编辑</el-button>
                <el-button type='danger' icon='el-icon-delete' size='mini' @click='deletedata(scope.row.attr_id)'>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label='静态属性' name='only'>
          <el-button type='primary' size='small' :disabled='isbtn' @click='addParam'>添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data='onlyData' border stripe>
            <!-- 折叠栏 -->
            <el-table-column type='expand'>
              <template slot-scope='scope'>
                <!-- 循环渲染tag -->
                <el-tag closable v-for='(item,index) in scope.row.attr_vals' :key='index' @close="closeTag(index,scope.row)">{{item}}</el-tag>
                <!-- new Tag -->
                <!-- 文本框 -->
                <el-input
                  class='input-new-tag'
                  v-if='scope.row.inputVisible'
                  v-model='scope.row.inputValue'
                  ref='saveTagInput'
                  size='small'
                  @keyup.enter.native='handleInputConfirm(scope.row)'
                  @blur='handleInputConfirm(scope.row)'
                ></el-input>
                <!-- 按钮 -->
                <el-button v-else class='button-new-tag' size='small' @click='showInput(scope.row)'>+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type='index' label='#'></el-table-column>
            <el-table-column label='属性名称' prop='attr_name'></el-table-column>
            <el-table-column label='操作'>
              <template slot-scope='scope'>
                <el-button type='primary' icon='el-icon-edit' size='mini' @click='showeditDialog(scope.row.attr_id)'>编辑</el-button>
                <el-button type='danger' icon='el-icon-delete' size='mini' @click='deletedata(scope.row.attr_id)'>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 添加参数Dialog对话框 -->
      <el-dialog :title='titleText' :visible.sync='ParamsDialogVisible' width='30%' @close='ParamsDialogClose'>
        <!-- 表单 -->
        <el-form :model='ParamsForm' :rules='Paramsrules' ref='ParamsFormRef' label-width='100px'>
          <el-form-item :label='titleText' prop='attr_name'>
            <el-input v-model='ParamsForm.attr_name'></el-input>
          </el-form-item>
        </el-form>
        <span slot='footer' class='dialog-footer'>
          <el-button @click='ParamsDialogVisible = false'>取 消</el-button>
          <el-button type='primary' @click='confirmParamsDialog'>确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑Dialog对话框 -->
      <el-dialog :title='"修改"+this.titleText' :visible.sync='editDialogVisible' width='30%' @close='editDialogClose'>
        <!-- 表单 -->
        <el-form :model='editParamsForm' :rules='Paramsrules' ref='editParamsFormRef' label-width='100px'>
          <el-form-item :label='titleText' prop='attr_name'>
            <el-input v-model='editParamsForm.attr_name'></el-input>
          </el-form-item>
        </el-form>
        <span slot='footer' class='dialog-footer'>
          <el-button @click='editDialogVisible = false'>取 消</el-button>
          <el-button type='primary' @click='confirmeditParamsDialog'>确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Params-C',
  data () {
    return {
      // 被激活的页签的名称
      activeName: 'many',
      // 级联选择器配置对象
      cascaderprops: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      cateList: [],
      selectList: [],
      // 动态参数数据
      manyData: [],
      // 静态参数数据
      onlyData: [],
      ParamsDialogVisible: false,
      // 表单
      ParamsForm: [],
      // 添加表单验证规则
      Paramsrules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      // 修改表单
      editParamsForm: []

    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    isbtn () {
      if (this.selectList.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的最后一项id
    cateid () {
      return this.selectList.length === 3 ? this.selectList[2] : null
    },
    // 动态计算标题文本
    titleText () {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  },
  methods: {
    // 获取参数列表
    async getCateList () {
      const { data: re } = await this.$http.get('categories')
      if (re.meta.status !== 200) {
        return this.$message.success('获取数据失败')
      }
      this.cateList = re.data
    },
    // 级联选择器变化
    cashandleChange () {
      this.getParamsData()
    },
    // tab切换
    tabhandleClick () {
      this.getParamsData()
    },
    // 获取参数数据
    async getParamsData () {
      if (this.selectList.length !== 3) {
        this.selectList = []
        this.manyData = []
        this.onlyData = []
        return
      }
      // console.log(this.selectList)
      // 根据所选id和面板获取数据
      const { data: re } = await this.$http.get(
        `categories/${this.cateid}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      if (re.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      re.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // new Tag显示与隐藏
        item.inputVisible = false
        // 文本框中输入的内容
        item.inputValue = ''
      })
      // console.log(re.data)
      if (this.activeName === 'many') {
        this.manyData = re.data
      } else {
        this.onlyData = re.data
      }
    },
    // 添加参数
    addParam () {
      this.ParamsDialogVisible = true
    },
    // 确认对话框
    confirmParamsDialog () {
      this.$refs.ParamsFormRef.validate(async (validate) => {
        if (!validate) return
        const { data: re } = await this.$http.post(
          `categories/${this.cateid}/attributes`,
          {
            attr_name: this.ParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (re.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.ParamsDialogVisible = false
        this.getParamsData()
      })
    },
    // 去除表单校验规则内容
    ParamsDialogClose () {
      this.$refs.ParamsFormRef.resetFields()
    },
    editDialogClose () {
      this.$refs.editParamsFormRef.resetFields()
    },
    // 显示编辑对话框
    async showeditDialog (id) {
      const { data: re } = await this.$http.get(
        `categories/${this.cateid}/attributes/${id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      )
      if (re.meta.status !== 200) {
        return this.$message.error('查询参数失败')
      }
      this.editDialogVisible = true
      this.editParamsForm = re.data
    },
    // 提交修改表单
    confirmeditParamsDialog () {
      this.$refs.editParamsFormRef.validate(async (validate) => {
        if (!validate) return
        const { data: re } = await this.$http.put(
          `categories/${this.cateid}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (re.meta.status !== 200) {
          return this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        this.editDialogVisible = false
        this.getParamsData()
      })
      this.editDialogVisible = false
    },
    // 删除
    async deletedata (id) {
      const confirmresult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (confirmresult !== 'confirm') {
        return
      }
      const { data: re } = await this.$http.delete(
        `categories/${this.cateid}/attributes/${id}`
      )
      if (re.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    // 控制展示new tag 文本框失去焦点
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      row.inputValue = ''
      // console.log(row)
      this.saveAttrVal(row)
    },
    async saveAttrVal (row) {
      // 发起请求
      const { data: re } = await this.$http.put(`categories/${this.cateid}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      if (re.meta.status !== 200) {
        return this.$message.error('添加参数失败')
      }
      this.$message.success('添加参数成功')
    },
    // 显示newtag按钮
    showInput (row) {
      row.inputVisible = !row.inputVisible
      // 自动获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 关闭tag
    closeTag (index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVal(row)
    }
  }
}
</script>

<style lang="less" scoped>
.el-alert {
  margin-bottom: 25px;
}
.el-cascader {
  margin-left: 10px;
}
.el-table {
  margin-top: 15px;
}
.el-tag {
  margin: 0 10px;
}
/deep/ .el-table__expanded-cell[class*="cell"] {
  padding: 20px 50px;
  padding-left: 40px !important;
}
.input-new-tag {
  width: 150px;
  margin: 0 10px;
}
</style>>
