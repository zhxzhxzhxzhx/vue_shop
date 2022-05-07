<template>
  <div class='Cate-container'>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class='el-icon-arrow-right'>
      <el-breadcrumb-item :to='{ path: "/home" }'>首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col :span='5'>
          <el-button type='primary' @click='addCate'>添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        :data='CateList'
        :columns='columns'
        :selection-type='false'
        border
        :expand-type='false'
        show-index
        index-text='#'
      >
        <!-- 是否有效 -->
        <template slot='isok' slot-scope='scope'>
          <i class='el-icon-success' v-if='scope.row.cat_deleted === false' style='color:lightgreen;font-size:20px'></i>
          <i class='el-icon-error' v-else style='color:red;font-size:20px'></i>
        </template>
        <!-- 排序 -->
        <template slot='rank' slot-scope='scope'>
          <el-tag v-if='scope.row.cat_level === 0'>一级</el-tag>
          <el-tag type='success' v-else-if='scope.row.cat_level === 1'>二级</el-tag>
          <el-tag type='warning' v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot='setting' slot-scope="scope">
          <el-button type='primary' icon='el-icon-edit' size='mini' @click="editCate(scope.row)">编辑</el-button>
          <el-button type='danger' icon='el-icon-delete' size='mini' @click="deleteCate(scope.row)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change='handleSizeChange'
        @current-change='handleCurrentChange'
        :current-page='requestdata.pagenum'
        :page-sizes='[1, 2, 5, 10]'
        :page-size='requestdata.pagesize'
        layout='total, sizes, prev, pager, next, jumper'
        :total='total'
      ></el-pagination>
      <!-- 添加分类的对话框 -->
      <el-dialog title='添加分类' :visible.sync='addCateDialogVisible' width='30%' close='closeAddDialog'>
        <!-- 添加分类表单 -->
        <el-form :model='addCateform' :rules='addCateformRules' ref='addCateformRef' label-width='100px'>
          <el-form-item label='分类名称: ' prop='cat_name'>
            <el-input v-model='addCateform.cat_name'></el-input>
          </el-form-item>
          <el-form-item label='父级分类: '>
            <el-cascader
              v-model='selectedKeys'
              :options='parantList'
              change-on-select
              clearable
              :props='cascaderprops'
              @change='cashandleChange'
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot='footer' class='dialog-footer'>
          <el-button @click='closeAddDialog'>取 消</el-button>
          <el-button type='primary' @click='confirmAddCate'>确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑的对话框 -->
      <el-dialog title='编辑' :visible.sync='editCateDialogVisible' width='30%' @close='closeeditDialog'>
        <!-- 编辑表单 -->
        <el-form :model='editCateform' :rules='addCateformRules' ref='editCateformRef' label-width='100px'>
          <el-form-item label='分类名称: ' prop='cat_name'>
            <el-input v-model='editCateform.cat_name'></el-input>
          </el-form-item>
        </el-form>
        <span slot='footer' class='dialog-footer'>
          <el-button @click='closeeditDialog'>取 消</el-button>
          <el-button type='primary' @click='confirmeditCate'>确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Cate-C',
  data () {
    return {
      requestdata: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      CateList: [],
      addCateform: {
        cat_name: '',
        // 父级id
        cat_pid: 0,
        // 当前层级
        cat_level: 0
      },
      total: '',
      addCateformRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      addCateDialogVisible: false,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'rank'
        },
        {
          label: '操作',
          type: 'template',
          template: 'setting'
        }
      ],
      parantList: '',
      selectedKeys: [],
      // 级联选择器配置对象
      cascaderprops: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 编辑请求表单
      editCateform: {
        cat_name: ''
      },
      editCateDialogVisible: false,
      editid: ''
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: re } = await this.$http.get('categories', {
        params: this.requestdata
      })
      if (re.meta.status !== 200) {
        this.$message.error('获取分类信息失败')
      }
      this.CateList = re.data.result
      this.total = re.data.total
      // console.log(this.CateList)
    },
    // 页面大小改变
    handleSizeChange (newSize) {
      this.requestdata.pagesize = newSize
      this.getCateList()
    },
    // 页数改变
    handleCurrentChange (newPage) {
      this.requestdata.pagenum = newPage
      this.getCateList()
    },
    // 关闭添加分类对话框
    closeAddDialog () {
      this.$refs.addCateformRef.resetFields()
      this.selectedKeys = []
      this.addCateform.cat_pid = 0
      this.addCateform.cat_level = 0
      this.addCateDialogVisible = false
    },
    // 添加分类按钮
    addCate () {
      this.addCateDialogVisible = true
      this.getParentCateList()
    },
    // 确认添加分类
    confirmAddCate () {
      this.addCateDialogVisible = false
      // console.log(this.addCateform)
      this.$refs.addCateformRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: re } = await this.$http.post(
          'categories',
          this.addCateform
        )
        if (re.meta.status !== 201) {
          return this.$message.success('添加分类失败')
        }
        this.getCateList()
        this.$refs.addCateformRef.resetFields()
        this.selectedKeys = []
        this.addCateform.cat_pid = 0
        this.addCateform.cat_level = 0
      })
    },
    // 获取父级列表
    async getParentCateList () {
      const { data: re } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (re.meta.status !== 200) {
        return this.$message.success('获取父级列表失败')
      }
      this.parantList = re.data
    },
    // 级联选择器改变
    cashandleChange () {
      if (this.selectedKeys.length !== 0) {
        this.addCateform.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateform.cat_level = this.selectedKeys.length
      } else {
        this.addCateform.cat_pid = 0
        this.addCateform.cat_level = 0
      }
    },
    // 关闭编辑对话框
    closeeditDialog () {
      this.$refs.editCateformRef.resetFields()
      this.editCateDialogVisible = false
    },
    // 提交编辑表单
    async confirmeditCate () {
      const { data: re } = await this.$http.put('categories/' + this.editid, this.editCateform)
      if (re.meta.status !== 200) {
        return this.$message.success('编辑失败')
      }
      this.getCateList()
      this.editCateDialogVisible = false
      this.$refs.editCateformRef.resetFields()
    },
    // 点击编辑按钮
    editCate (data) {
      this.editCateDialogVisible = true
      this.editid = data.cat_id
    },
    // 删除分类
    async deleteCate (data) {
      const resultconfirm = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (resultconfirm !== 'confirm') {
        return
      }
      const { data: re } = await this.$http.delete('categories/' + data.cat_id)
      if (re.meta.status !== 200) {
        return this.$message.success('删除失败')
      }
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
