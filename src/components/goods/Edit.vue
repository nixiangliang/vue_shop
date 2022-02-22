<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品修改</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="修改商品信息" type="info" center show-icon :closable="false"></el-alert>

      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- Tabs栏区域 -->
      <el-form :model="goodlist" :rules="goodlistRules" ref="goodlistRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="goodlist.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="goodlist.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="goodlist.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="goodlist.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 商品分类的级联选择器 -->
              <el-cascader expand-trigger="hover" :options="catelist" :props="cateProps" v-model="goodlist.goods_cat" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染动态参数表单的Item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到的后台API地址 -->
            <el-upload :action="uploadURl" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :file-list="fileList2" :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="goodlist.goods_introduce"></quill-editor>
            <!-- 修改商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="editGoods">确定</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览的对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      // 步骤条激活项的索引
      activeIndex: '0',
      // 修改商品的表单验证规则对象
      goodlistRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      // 商品分类列表
      catelist: [],
      // 商品分类属性列表
      cateProps: {
        // 你看到的属性
        label: 'cat_name',
        // 你选中的属性id
        value: 'cat_id',
        // 父子节点的嵌套属性
        children: 'children'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的 URL 地址
      uploadURl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的 headers 请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览的路径
      previewPath: '',
      // 控制图片预览对话框的显示与隐藏
      previewVisible: false,
      // 根据id查询到的商品列表对象
      goodlist: {},
      // 上传的图片列表
      fileList2: []
    }
  },
  created() {
    this.getCateList()
    this.getGoodsListById()
  },
  methods: {
    // 根据id获取商品列表数据
    async getGoodsListById() {
      const id = window.localStorage.getItem('goods_id')
      const { data: res } = await this.$http.get(`goods/${id}`)
      // window.localStorage.removeItem('goods_id')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }

      // this.$message.success('获取商品列表数据成功！')
      // 字符串转为数组
      res.data.goods_cat = res.data.goods_cat.split(',')
      // 字符串转为数字
      res.data.goods_cat = res.data.goods_cat.map(Number)
      this.goodlist = res.data
      console.log(this.goodlist)

      this.goodlist.pics.forEach((item) => {
        const pics = {
          name: `${this.goodlist.goods_name}.jpg`,
          url: item.pics_sma_url
        }
        this.fileList2.push(pics)
      })
    },
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }

      this.catelist = res.data
      // console.log(this.catelist)
    },
    // 级联选择器选中项发生变化会触发这个函数
    handleChange() {
      // console.log(this.goodlist.goods_cat)
      if (this.goodlist.goods_cat.length !== 3) {
        this.goodlist.goods_cat = []
      }
      console.log(this.goodlist)
    },
    // 切换标签之前的钩子，若返回 false,则阻止切换
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.goodlist.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // tab标签页发生切换会触发这个函数
    async tabClicked() {
      // console.log(this.activeIndex)
      // 证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })

        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }

        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        // console.log(res.data)
        this.manyTableData = res.data
        // 证明访问的是静态属性面板
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })

        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败！')
        }

        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.url
      this.previewVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      console.log(file)
      // 1.获取将要删除的图片的路径
      const filePath = file.url
      // 2.从 pics 数组中，找到这个图片对应的索引值
      const i = this.goodlist.pics.findIndex((x) => x.pic === filePath)
      // 3.调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.goodlist.pics.splice(i, 1)
      console.log(this.goodlist)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response)
      // 1.拼接得到一个图片信息对象
      const picInfo = {
        pics_sma_url: response.data.url
      }
      // 2.将图片信息对象 push 到 pics
      this.goodlist.pics.push(picInfo)
      console.log(this.goodlist)
    },
    // 点击确定，修改商品
    editGoods() {
      this.$refs.goodlistRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请填写必要的商品数据')
        }

        // 执行添加的业务逻辑
        // lodash   cloneDeep(obj)
        // 深拷贝一个对象，前面的goodlist是一个数组，这里需要字符串
        // 如果把goodlist 直接转为字符串，商品分类的级联选择器会报错，因为 级联选择器要求 v-model 必须绑定到数组上
        const form = _.cloneDeep(this.goodlist)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.goodlist.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.goodlist.attrs.push(newInfo)
        })
        form.attrs = this.goodlist.attrs
        console.log(form)

        // 发起请求,添加商品
        // 商品的名称,必须是唯一的
        const { data: res } = await this.$http.put(`goods/${form.goods_id}`, form)

        if (res.meta.status !== 200) {
          return this.$message.error('修改商品失败!')
        }

        this.$message.success('修改商品成功!')
        // 跳转到商品列表页面
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 三级分类的id
    cateId() {
      if (this.goodlist.goods_cat.length === 3) {
        return this.goodlist.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
