<template>
  <div>
    <el-form :model="spuInfo" label-width="80px">
      <el-form-item label="SPU名称">
        <el-input v-model="spuInfo.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select v-model="spuInfo.tmId" placeholder="请选择品牌">
          <el-option
            v-for="item in trademarkList"
            :key="item.id"
            :label="item.tmName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          type="textarea"
          :rows="4"
          v-model="spuInfo.description"
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handlePictureSuccess"
          :file-list="spuImageList"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性" :inline="true">
        <el-select
          v-model="unUsedSaleAttrId"
          :placeholder="
            unUseSaleAttrList.length > 0
              ? `还有${unUseSaleAttrList.length}未选择`
              : '没有啦！！！'
          "
        >
          <el-option
            v-for="item in unUseSaleAttrList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
        <el-button type="primary" @click="addSaleAttrList"
          >添加销售属性</el-button
        >
        <el-table :data="spuInfo.spuSaleAttrList" border style="width: 100%">
          <el-table-column label="序号" type="index" align="center" width="80">
          </el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="width">
          </el-table-column>
          <el-table-column label="属性值名称列表" width="width">
            <template v-slot="{ row }">
              <el-tag
                :key="item.id"
                v-for="item in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
              >
                {{ item.saleAttrValueName }}
              </el-tag>
              <!-- 属性值列表点击span切换input -->
              <el-input
                class="input-new-tag"
                v-show="row.isShow"
                v-model="unsaleAttrValueName"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
              >
              </el-input>
              <el-button
                v-show="!row.isShow"
                class="button-new-tag"
                size="small"
                @click="addSpuSaleAttrValueList(row)"
                >添加属性</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <HintButton
              type="danger"
              icon="el-icon-delete"
              title="删除"
              circle
            ></HintButton>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "spuForm",
  data() {
    return {
      unUsedSaleAttrId: "", //接受被选中的销售属性的id
      dialogImageUrl: "",
      dialogVisible: false,
      unsaleAttrValueName: "",
      spuInfo: {
        category3Id: "",
        description: "", //描述
        spuName: "", //名称
        tmId: "",
        spuImageList: [],

        spuSaleAttrList: [
          /* {
            baseSaleAttrId: 0,
            saleAttrName: "",
            spuSaleAttrValueList: [
              {
                baseSaleAttrId: 0,
                saleAttrValueName: "",
              }, 
            ],
          }, */
        ],
      },
      spuImageList: [], //请求初始化的spu图片列表
      trademarkList: [], //请求初始化的所有品牌列表
      saleAttrList: [], //请求初始化的所有的销售属性列表
    };
  },

  methods: {
    // 在父组件中点击添加
    async addSpu(category3Id) {
     
      this.init()
      // 获取所有的销售属性列表
      const rel = await this.$api.spu.getSaleAttrList();
      if (rel.code === 20000 || rel.code === 200) {
        this.saleAttrList = rel.data;
      }
      // 获取品牌列表
      const rel2 = await this.$api.trademark.getList();
      if (rel2.code === 200 || rel2.code === 20000) {
        this.trademarkList = rel2.data;
      }
       this.spuInfo.category3Id=category3Id
    },
    // 在父组件中点击修改
    async setSpu(row,category3Id) {
       
      // 获取spuInfo
      const rel = await this.$api.spu.get(row.id);
      if (rel.code === 20000 || rel.code === 200) {
        this.spuInfo = rel.data;
      }

      //获取销售属性
      const rel1 = await this.$api.spu.getSaleAttrList();
      if (rel1.code === 20000 || rel1.code === 200) {
        this.saleAttrList = rel1.data;
      }
      // 获取品牌列表
      const rel2 = await this.$api.trademark.getList();
      if (rel2.code === 200 || rel2.code === 20000) {
        this.trademarkList = rel2.data;
      }
      const rel3 = await this.$api.sku.getSpuImageList(row.id);
      if (rel3.code === 200 || rel3.code === 20000) {
        const spuImageList = rel3.data;
        // 往每个图片对象当中添加name和url
        spuImageList.forEach((item) => {
          item.name = item.imgName;
          item.url = item.imgUrl;
        });

        this.spuImageList = spuImageList;
      }
      this.spuInfo.category3Id=category3Id
    },
    // 添加销售属性
    addSaleAttrList() {
      let arr = [];
      // 过滤出被选中的销售属性
      arr = this.saleAttrList.filter((item) => {
        return item.id === this.unUsedSaleAttrId;
      });
      // 点击添加后把选择的销售属性添加到spuInfo里
      this.spuInfo.spuSaleAttrList.push({
        saleAttrName: arr[0].name,
        baseSaleAttrId: arr[0].id,
        spuSaleAttrValueList: [],
      });
      this.unUsedSaleAttrId="";
    },
    // 添加销售属性值列表
    addSpuSaleAttrValueList(row) {
      // 给每一个spuSaleAttrList添加一个isShow属性，用来判断添加属性的span和input标签的显示隐藏
      this.spuInfo.spuSaleAttrList.forEach((item) => {
        this.$set(item, "isShow", false);
      });
      // 让被点击的那个的input显示
      row.isShow = true;
    },
    // input输入完成
    handleInputConfirm(row) {
      if (this.unsaleAttrValueName.trim() === "") return;
      // 判断重复
      let isTrue = row.spuSaleAttrValueList.some((item) => {
        return item.saleAttrValueName === this.unsaleAttrValueName;
      });
      // 如果有重复的
      if (isTrue) {
        this.unsaleAttrValueName = "";
        row.isShow = false;
        return;
      }
      row.spuSaleAttrValueList.push({
        baseSaleAttrId: row.baseSaleAttrId,
        saleAttrValueName: this.unsaleAttrValueName,
      }),
        (row.isShow = false);
      this.unsaleAttrValueName = "";
    },
    // 删除图片回调
    handleRemove(file, fileList) {
      this.spuImageList = fileList;
    },
    // 上传成功的回调
    handlePictureSuccess(response, file, fileList) {
      this.spuImageList = fileList;
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    // 保存
    async save() {
      // 整理图片列表
      // 修改的时候spuInfo.spuImageList为null 不能调用push方法，所以给他赋值一个空数组
      this.spuInfo.spuImageList=[]
      this.spuImageList.forEach((item) => {
        // 给每个spuImageList添加属性
        this.spuInfo.spuImageList.push({
          id: item.id,
          imgName:item.name,
          imgUrl: item.imgUrl||item.response.data,
          spuId: this.spuInfo.id,
        });
      });
      // 删除无用属性
      this.spuInfo.spuSaleAttrList.forEach(item=>{
        delete item.isShow
      })
      // 发请求
      try {
         const rel=await this.$api.spu.addUpdate(this.spuInfo)
         if(rel.code===20000||rel.code===200){
          this.$emit('update:isShowSpu', false)
          this.$emit("saverel",this.spuInfo.id)
          this.init()
         }
      } catch (error) {
        this.$message.error("请求失败~~~")
      }

    },
    // 初始化data
    init(){
      Object.assign(this._data,this.$options.data())
    },
    // 点击取消
    cancel(){
      this.init()
      this.$emit('update:isShowSpu', false)
    }
  },
  computed: {
    unUseSaleAttrList() {
      // 从所有的销售属性列表当中过滤，不在spu自己的销售属性列表当中的 所有销售属性
      return this.saleAttrList.filter((item) => {
        return this.spuInfo.spuSaleAttrList.every((item1) => {
          return item1.saleAttrName !== item.name;
        });
      });
    },
  },
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>