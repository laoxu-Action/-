<template>
  <div>
    <el-form :model="skuInfo" label-width="80px">
      <el-form-item label="SPU名称">
        {{ spu.spuName }}
      </el-form-item>
      <el-form-item label="SKU名称">
        <el-input placeholder="SKU名称" v-model="skuInfo.skuName"></el-input>
      </el-form-item>
      <el-form-item label="价格(元)">
        <el-input placeholder="价格(元)" v-model="skuInfo.price"></el-input>
      </el-form-item>
      <el-form-item label="重量(千克)">
        <el-input placeholder="重量(千克)" v-model="skuInfo.weight"></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input
          type="textarea"
          placeholder="规格描述"
          v-model="skuInfo.skuDesc"
        ></el-input>
      </el-form-item>
      <el-form-item label="平台属性">
        <el-form :inline="true" label-width="80px">
          <el-form-item
            :label="attrList.attrName"
            v-for="attrList in attrList"
            :key="attrList.id"
          >
            <el-select
              value=""
              placeholder="请选择平台属性"
              v-model="attrList.customValueId"
            >
              <el-option
                :label="item.valueName"
                v-for="item in attrList.attrValueList"
                :key="item.id"
                :value="`${attrList.id}:${item.id}`"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-form :inline="true" ref="form" :model="skuInfo" label-width="80px">
          <el-form-item
            :label="SpuSaleAttrList.saleAttrName"
            v-for="SpuSaleAttrList in SpuSaleAttrList"
            :key="SpuSaleAttrList.id"
          >
            <el-select
              value=""
              placeholder="请选择销售属性"
              v-model="SpuSaleAttrList.customValueId"
            >
              <el-option
                :label="item.saleAttrValueName"
                v-for="item in SpuSaleAttrList.spuSaleAttrValueList"
                :key="item.id"
                :value="`${SpuSaleAttrList.id}:${item.id}`"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="图片列表">
        <el-table
          ref="multipleTable"
          :data="SpuImageList"
          border
          tooltip-effect="dark"
          @selection-change="handleSelectionChange"
          style="width: 100%"
        >
          <el-table-column type="selection" width="100"> </el-table-column>
          <el-table-column label="图片">
            <template v-slot="{ row }">
              <img :src="row.imgUrl" style="width: 50px; height: 50px" />
            </template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称"> </el-table-column>
          <el-table-column prop="isDefault" label="操作" show-overflow-tooltip>
            <template v-slot="{ row }">
              <div>
                <el-button
                  type="primary"
                  v-show="row.isDefault === '0'"
                  @click="setDefault(row)"
                  >设为默认</el-button
                >
                <el-button type="success" v-show="row.isDefault === '1'"
                  >默认</el-button
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="$emit('update:isShowSku', false)">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: "skuForm",
  data() {
    return {
      spu: {},
      skuInfo: {
        // 父组件传递过来的
        category3Id: "",
        spuId: "",
        tmId: "",

        // 通过v-model直接收集的
        skuName: "",
        skuDesc: "",
        weight: "",
        price: "",

        // 通过js代码收集
        skuDefaultImg: "",
        skuAttrValueList: [
          // {
          //   attrId: 0,
          //   attrName: "string",
          //   id: 0,
          //   skuId: 0,
          //   valueId: 0,
          //   valueName: "string"
          // }
        ],
        skuSaleAttrValueList: [
          // {
          //   id: 0,
          //   saleAttrId: 0,
          //   saleAttrName: "string",
          //   saleAttrValueId: 0,
          //   saleAttrValueName: "string",
          //   skuId: 0,
          //   spuId: 0
          // }
        ],
        skuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   isDefault: "string",
          //   skuId: 0,
          //   spuImgId: 0
          // }
        ],
      },
      SpuSaleAttrList: [], //销售属性
      SpuImageList: [],
      attrList: [], //平台属性
      multipleSelection: [], //被选择的图片
    };
  },
  methods: {
    // 初始化数据
    async skuInit(row, category1Id, category2Id) {
      let { category3Id, id } = row;
      this.spu = row;
      // 获取商品属性列表请求
      const rel = this.$api.attr.getList({
        category1Id,
        category2Id,
        category3Id,
      });
      // 获取指定SPU的id对应的销售属性列表
      const rel1 = this.$api.sku.getSpuSaleAttrList(id);
      // 获取图片列表
      const rel2 = this.$api.sku.getSpuImageList(id);
      try {
        const relAll = await Promise.all([rel, rel1, rel2]);
        console.log(relAll);
        this.attrList = relAll[0].data;
        this.SpuSaleAttrList = relAll[1].data;
        let SpuImageList = relAll[2].data.map((item) => {
          item.isDefault = "0";
          return item;
        });
        this.SpuImageList = SpuImageList;
      } catch (error) {
        this.$message.error("初始化数据请求失败~~~~~~~~~");
      }
    },
    // 设置默认 排他
    setDefault(row) {
      this.SpuImageList.forEach((item) => {
        item.isDefault = "0";
      });
      row.isDefault = "1";
      // 保存默认数据
      this.skuInfo.skuDefaultImg = row.imgUrl;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 初始化数据
    Init(){
        Object.assign(this._data,this.$options.data())
    },
    //   保存
    async save() {
      // 整理数据
      let { category3Id, id, tmId } = this.spu;
      // 整理销售属性数据
      this.SpuSaleAttrList.forEach((item) => {
        if (item.customValueId) {
          let [saleAttrId, saleAttrValueId] = item.customValueId.split(":");
          let obj = { saleAttrId, saleAttrValueId};
         this.skuInfo.skuSaleAttrValueList.push(obj);
        }
      });
      // 整理平台属性数据
      this.attrList.forEach((item) => {
        if (item.customValueId) {
          let [attrId, valueId] = item.customValueId.split(":");
          let obj = { attrId, valueId };
          this.skuInfo.skuAttrValueList.push(obj);
        }
      });
      // 整理图片列表数据
      this.skuInfo.skuImageList = this.multipleSelection;
      // 整理其他数据
      this.skuInfo.category3Id = category3Id;
      this.skuInfo.spuId = id;
      this.skuInfo.tmId = tmId;
      // 发送请求
      try {
        const rel = await this.$api.sku.addUpdate(this.skuInfo);
        if (rel.code === 200 || rel.code === 20000) {
        this.$message.success("保存正确~~~~")
          this.$emit('update:isShowSku', false)
          this.Init()
        } else {
          this.$message.error("保存错误~~~");
        }
      } catch (error) {
        this.$message.error("请求保存错误~~~");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
</style>