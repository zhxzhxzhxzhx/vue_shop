<template>
  <div class='order-container'>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class='el-icon-arrow-right'>
      <el-breadcrumb-item :to='{ path: "/home" }'>首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col :span='8'>
          <el-input placeholder='请输入内容'>
            <el-button slot='append' icon='el-icon-search'></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表单 -->
      <el-table :data='orderData' border style='width: 100%'>
        <el-table-column type='index' label='#'></el-table-column>
        <el-table-column label='订单编号' prop='order_number'></el-table-column>
        <el-table-column label='订单价格' prop='order_price' width='80px'></el-table-column>
        <el-table-column label='是否付款' width='100px'>
          <template slot-scope='scope'>
            <el-tag v-if='scope.row.order_pay === 1'>已付款</el-tag>
            <el-tag v-else type='danger'>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label='是否发货' prop='is_send' width='80px'></el-table-column>
        <el-table-column label='下单时间' width='150px'>
          <template slot-scope='scope'>{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label='操作' width='120px'>
          <template>
            <el-button icon='el-icon-edit' type='primary' size='mini' @click='showAddress'></el-button>
            <el-button icon='el-icon-location-outline' type='warning' size='mini' title='4'></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change='handleSizeChange'
        @current-change='handleCurrentChange'
        :current-page='userInfo.pagenum'
        :page-sizes='[2, 5, 10, 20]'
        :page-size='userInfo.pagesize'
        layout='total, sizes, prev, pager, next, jumper'
        :total='total'
      ></el-pagination>
      <!-- 修改地址对话框 -->
      <el-dialog
        title='修改地址'
        :visible.sync='AddressdialogVisible'
        width='30%'
        @close='closeEdit'
      >
        <!-- 表单 -->
        <el-form :model='EditaddressForm' :rules='EditaddressFormrules' ref='EditaddressFormref' label-width='100px'>
          <el-form-item label='省市区/县' prop='address1'>
            <!-- 级联选择器 -->
            <el-cascader v-model='EditaddressForm.address1' :options='citydata' :props='prop'></el-cascader>
          </el-form-item>
          <el-form-item label='详细地址' prop='address2'>
            <el-input v-model='EditaddressForm.address2'></el-input>
          </el-form-item>
        </el-form>
        <span slot='footer' class='dialog-footer'>
          <el-button @click='AddressdialogVisible = false'>取 消</el-button>
          <el-button type='primary' @click='AddressdialogVisible = false'>确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import citydata from './citydata'
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Order',
  data () {
    return {
      userInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderData: [],
      AddressdialogVisible: false,
      // 修改地址表单
      EditaddressForm: {
        address1: [],
        address2: ''
      },
      // 修改地址表单校验规则
      EditaddressFormrules: {
        address1: [
          { required: true, message: '请输入省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 省市区
      selectValue: [],
      citydata,
      prop: {
        expandTrigger: 'hover'
      }
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: re } = await this.$http.get('orders', {
        params: this.userInfo
      })
      if (re.meta.status !== 200) {
        this.$message.error('获取数据列表失败')
      }
      this.orderData = re.data.goods
      this.total = re.data.total
    },
    // 改变页面数据大小
    handleSizeChange (newSize) {
      this.userInfo.pagesize = newSize
      this.getOrderList()
    },
    // 改编页码
    handleCurrentChange (newPage) {
      this.userInfo.pagenum = newPage
      this.getOrderList()
    },
    // 修改地址
    showAddress () {
      this.AddressdialogVisible = true
    },
    // 清空表单
    closeEdit () {
      this.$nextTick(() => {
        this.$refs.EditaddressFormref.resetFields()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 20px;
}
</style>>
