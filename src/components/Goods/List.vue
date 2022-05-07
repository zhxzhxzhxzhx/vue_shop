<template>
  <div class='List-container'>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class='el-icon-arrow-right'>
      <el-breadcrumb-item :to='{ path: "/home" }'>首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col :span='7'>
          <el-input placeholder='请输入内容' v-model='queryInfo.query' class='input-with-select' clearable @clear="getGoodsList">
            <el-button slot='append' icon='el-icon-search' @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span='2'>
          <el-button type='primary' @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data='goodsList' border style='width: 100%' stripe>
        <el-table-column type='index' label='#'></el-table-column>
        <el-table-column prop='goods_name' label='商品名称'></el-table-column>
        <el-table-column prop='goods_price' label='商品价格' width="95px"></el-table-column>
        <el-table-column prop='goods_weight' label='商品重量' width="70px"></el-table-column>
        <el-table-column prop='add_time' label='商品创建时间' width="140px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
             <el-button type="primary" icon="el-icon-edit" circle size="mini" @click="goEdit(scope.row.goods_id)"></el-button>
              <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change='handleSizeChange'
        @current-change='handleCurrentChange'
        :current-page='queryInfo.pagenum'
        :page-sizes='[10, 15, 20, 25]'
        :page-size='queryInfo.pagesize'
        layout='total, sizes, prev, pager, next, jumper'
        :total='total'
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
import eventBus from '../../../eventBus.js'
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'List',
  data () {
    return {
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 获取数据列表
      goodsList: [],
      total: ''
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 根据查询参数获取数据
    async getGoodsList () {
      const { data: re } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (re.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      this.goodsList = re.data.goods
      this.total = re.data.total
    },
    // 分页大小改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 页码改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 根据id删除商品
    async removeById (id) {
      const resultconfirm = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (resultconfirm !== 'confirm') {
        return
      }
      const { data: re } = await this.$http.delete('goods/' + id)
      if (re.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getGoodsList()
    },
    // 添加商品
    goAddPage () {
      this.$router.push('/goods/add')
    },
    // 编辑商品
    goEdit (id) {
      // eventBus传id
      eventBus.$emit('id', id)
      this.$router.push('/goods/edit')
    }

  }
}
</script>

<style lang="less" scoped>
.el-button {
  margin-left: 15px;
}
</style>>
