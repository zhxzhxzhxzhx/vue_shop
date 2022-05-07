<template>
  <div class='Add-container'>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class='el-icon-arrow-right'>
      <el-breadcrumb-item :to='{ path: "/home" }'>首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>编辑商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert title='添加商品信息' type='info' center show-icon :closable='false'></el-alert>
      <!-- 进度条 -->
      <el-steps :active='activeIndex - 0' finish-status='success' align-center>
        <el-step title='基本信息'></el-step>
        <el-step title='商品参数'></el-step>
        <el-step title='商品属性'></el-step>
        <el-step title='商品图片'></el-step>
        <el-step title='商品内容'></el-step>
        <el-step title='完成'></el-step>
      </el-steps>
      <!-- tab栏 -->
      <!-- 表单 -->
      <el-form :model='addForm' :rules='addFormRules' ref='addFormRef' label-width='100px' label-position='top'>
        <el-tabs v-model='activeIndex' :tab-position='tabPosition' :before-leave='beforeTabLeave' @tab-click='tabClick'>
          <el-tab-pane label='基本信息' name='0'>
            <el-form-item label='商品名称' prop='goods_name'>
              <el-input v-model='addForm.goods_name'></el-input>
            </el-form-item>
            <el-form-item label='商品价格' prop='goods_price'>
              <el-input v-model='addForm.goods_price' type='number'></el-input>
            </el-form-item>
            <el-form-item label='商品重量' prop='goods_weight'>
              <el-input v-model='addForm.goods_weight' type='number'></el-input>
            </el-form-item>
            <el-form-item label='商品数量' prop='goods_number'>
              <el-input v-model='addForm.goods_number' type='number'></el-input>
            </el-form-item>
            <el-form-item label='商品分类' prop='goods_cat'>
              <!-- 级联选择器 -->
              <el-cascader
                v-model='addForm.goods_cat'
                clearable
                :options='parentList'
                :props='cascaderprops'
                @change='handleChange'
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label='商品参数' name='1'>
            <el-form-item :label='item.attr_name' :key='item.attr_id' v-for='item in manyData'>
              <el-checkbox-group v-model='item.attr_vals'>
                <el-checkbox v-for='(item1,index) in item.attr_vals' :key='index' :label='item1' border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label='商品属性' name='2'>
            <el-form-item v-for='item in onlyData' :key='item.attr_id' :label='item.attr_name'>
              <el-input v-model='item.attr_vals'></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label='商品图片' name='3'>
            <!-- 图片上传 -->
            <el-upload
              action='http://127.0.0.1:8888/api/private/v1/upload'
              :on-preview='handlePreview'
              :on-remove='handleRemove'
              list-type='picture'
              :headers='uploadHeaders'
              :on-success='handleSuccess'
            >
              <el-button size='small' type='primary'>点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label='商品内容' name='4'>
            <!-- 富文本编辑器 -->
             <quill-editor v-model="addForm.goods_introduce"></quill-editor>
             <el-button type="primary" class="Btnadd" @click="addclick">修改商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <!-- 显示图片对话框 -->
      <el-dialog title='图片预览' :visible.sync='PicDialogVisible' width='50%'>
        <img :src="previewPic" alt="" style="width: 100%">
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import _ from 'lodash'
import eventBus from '../../../eventBus.js'
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Add',
  data () {
    return {
      // 激活第几步骤
      activeIndex: '0',
      // tab栏位置
      tabPosition: 'left',
      // 添加表单
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 修改id
      id: '',
      // 表单校验规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      parentList: [],
      // 级联选择器配置对象
      cascaderprops: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表
      manyData: {},
      onlyData: {},
      // 图片上传组件请求头
      uploadHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      PicDialogVisible: false,
      // 预览图片路径
      previewPic: ''
    }
  },
  created () {
    this.getParentList()
  },
  computed: {
    selectedId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  methods: {
    // 获取参数列表
    async getParentList () {
      const { data: re } = await this.$http.get('categories')
      if (re.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      this.parentList = re.data
    },
    // 级联选择器变化
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
      // this.selectedKeys = this.selectedKeys.join(',')
      console.log(this.addForm.goods_cat)
    },
    // Tab栏变化
    beforeTabLeave (activeTab, oldActiveTab) {
      if (oldActiveTab === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 点价tab触发事件
    async tabClick () {
      // console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        const { data: re } = await this.$http.get(
          `categories/${this.selectedId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        )
        if (re.meta.status !== 200) {
          this.$message.error('获取参数列表失败')
        }
        re.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyData = re.data
        // console.log(re.data)
      } else if (this.activeIndex === '2') {
        const { data: re } = await this.$http.get(
          `categories/${this.selectedId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        )
        if (re.meta.status !== 200) {
          this.$message.error('获取参数列表失败')
        }
        this.onlyData = re.data
        console.log(this.onlyData)
      }
    },
    // 图片预览事件
    handlePreview (file) {
      this.PicDialogVisible = true
      this.previewPic = file.response.data.url
    },
    // 图片取消
    handleRemove (file) {
      const path = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex((item) => item.pic === path)
      this.addForm.pics.splice(i, 1)
    },
    // 上传图片成功
    handleSuccess (response) {
      const item = { pic: response.data.tmp_path }
      this.addForm.pics.push(item)
    },
    // 提交表单
    addclick () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        // 提交表单
        this.manyData.forEach(item => {
          const i = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(i)
        })
        this.onlyData.forEach(item => {
          const i = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(i)
        })
        // eventBus接受id
        eventBus.$on('id', (id) => {
          this.id = id
        })
        // 深拷贝表单，防止级联选择器等报错
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        console.log(form)
        const { data: re } = await this.$http.post('goods/' + this.id, form)
        if (re.meta.status !== 201) {
          return this.$message.error('修改表单失败')
        }
        this.$message.success('修改表单成功')
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin: 20px 0;
}
/deep/ .el-step__title {
  font-size: 13px !important;
}
/deep/ .el-checkbox {
  margin: 0;
  margin-right: 10px !important;
}
/deep/ .ql-editor {
  min-height: 300px !important;
}
.Btnadd {
  margin-top: 15px;
  float: right;
}
</style>>
