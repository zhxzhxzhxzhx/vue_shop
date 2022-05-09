<template>
  <div class="report-container">
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class='el-icon-arrow-right'>
      <el-breadcrumb-item :to='{ path: "/home" }'>首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <div class="main" ref="main"></div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import _ from 'lodash'
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'report',
  data () {
    return {
      // 要合并的选项
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created () {

  },
  async mounted () {
    // 基于准备好的dom，初始化echarts实例
    const myChart = echarts.init(this.$refs.main)
    const { data: re } = await this.$http.get('reports/type/1')
    if (re.meta.status !== 200) {
      return this.$message.error('获取报表信息失败')
    }
    // 合并数据
    // Object.assign(this.options, re.data)
    const data = _.merge(re.data, this.options)
    // 绘制图表
    myChart.setOption(data)
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
  .main {
    // margin: 0 auto;
    width: 600px;
    height: 600px;
  }
</style>>
