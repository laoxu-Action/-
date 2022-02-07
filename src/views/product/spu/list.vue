<template>
  <div style="margin: 20px">
    <el-card>
      <FormInline @changeListId="changeListId" :isShow="isShowList"></FormInline>
    </el-card>
    <el-card style="margin-top: 20px">
      <div v-show="!isShowSpu && !isShowSku">
        <el-button
          type="primary"
          icon="el-icon-circle-plus-outline"
          @click="showAddSpuForm"
          >添加SPU</el-button
        >
        <el-table :data="records" border style="width: 100%">
          <el-table-column
            prop="prop"
            label="序号"
            type="index"
            width="80"
            align="center"
          >
          </el-table-column>
          <el-table-column prop="spuName" label="SPU名称" width="width">
          </el-table-column>
          <el-table-column prop="description" label="SPU描述" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template v-slot="{ row }">
              <HintButton
                type="success"
                icon="el-icon-plus"
                title="添加sku"
                @click="showAddSkuForm(row)"
                circle
              ></HintButton>
              <HintButton
                type="warning"
                icon="el-icon-edit"
                title="修改spu"
                @click="showUpdateSpuForm(row)"
                circle
              ></HintButton>
              <HintButton
                type="info"
                icon="el-icon-info"
                title="查看spu的sku列表"
                @click="viewSkuList(row)"
                circle
              ></HintButton>
              <HintButton
                type="danger"
                icon="el-icon-delete"
                title="删除spu"
                @click="relSpu(row)"
                circle
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页器 -->
        <el-pagination
          style="text-align: center"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="page"
          :page-sizes="[3, 5, 7, 9]"
          :page-size="limit"
          layout=" prev, pager, next,->, jumper,sizes,total "
          :total="total"
        >
        </el-pagination>
      </div>
      <!-- spu添加修改 -->
      <SpuForm
        v-show="isShowSpu"
        :isShowSpu.sync="isShowSpu"
        ref="spu"
        @saverel="saverel"
      ></SpuForm>
      <!-- sku添加 -->
      <SkuForm
        v-show="isShowSku"
        ref="sku"
        :isShowSku.sync="isShowSku"
      ></SkuForm>
    </el-card>
    <el-dialog :title="`${skuTableName}的sku列表`" :visible.sync="isShowViewSkuList">
      <el-table :data="viewSkuValueList">
        <el-table-column
          prop="skuName"
          label="名称"
          width="150"
        ></el-table-column>
        <el-table-column
          prop="price"
          label="价格"
          width="200"
        ></el-table-column>
        <el-table-column prop="weight" label="重量"></el-table-column>
        <el-table-column  label="默认图片">
          <template v-slot="{row}">
            <img :src="row.skuDefaultImg" style="width:100px;height:100px">
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import SkuForm from "./skuForm";
import SpuForm from "./spuForm";
export default {
  name: "spu",
  components: { SpuForm, SkuForm },
  data() {
    return {
      isShowList:true,//三级联动总开关
      isShowViewSkuList:false,
      isShow: true,
      category1Id: "",
      category2Id: "",
      category3Id: "",
      records: [],
      isShowSpu: false,
      isShowSku: false,
      total: 0,
      page: 1,
      limit: 3,
      skuTableName:"",
      viewSkuValueList:[],//查看一条spu的sku列表
    };
  },
  methods: {
    // 获取属性列表
    changeListId({ categoryId, level }) {
      if (level === 1) {
        // 点击一级分类 需要清除二三级分类
        this.category2Id = "";
        this.category3Id = "";
        this.propertyList = [];
        this.category1Id = categoryId;
      } else if (level === 2) {
        // 点击二级分类 需要清除三级分类
        this.category3Id = "";
        this.propertyList = [];
        this.category2Id = categoryId;
      } else {
        this.category3Id = categoryId;
        // 发送获取请求
        this.getList();
      }
    },
    // 通过分页和id获取总数据
    async getList() {
      try {
        const rel = await this.$api.spu.getList(
          this.page,
          this.limit,
          this.category3Id
        );
        if (rel.code === 20000 || rel.code === 200) {
          this.total = rel.data.total;
          this.records = rel.data.records;
        } else {
          this.$message.error("获取列表失败~~");
        }
      } catch (error) {
        this.$message.error("请求列表失败~~");
      }
    },
    // 点击添加SPU
    showAddSpuForm() {
      this.$refs.spu.addSpu(this.category3Id);
      this.isShowSpu = true;
    },
    // 点击修改SPU
    showUpdateSpuForm(row) {
      this.$refs.spu.setSpu(row, this.category3Id);
      this.isShowSpu = true;
    },
    // 点击添加SKU
    showAddSkuForm(row) {
      // 点击添加，让skuForm中实行初始化数据
      this.$refs.sku.skuInit(row, this.category1Id, this.category2Id);
      this.isShowSku = true;
    },
    // 分页回调
    handleSizeChange(val) {
      this.limit = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.getList();
    },
    // 成功的回调
    saverel(id) {
      if (id) {
        // 修改的话，留当前页
        this.getList();
      } else {
        this.page = 1;
        this.getList();
      }
    },
    // 删除spu
    async relSpu(row) {
      try {
        const rel = await this.$api.spu.remove(row.id);
        if (rel.code === 20000 || rel.code === 200) {
          this.$message.success("删除成功~~~");
          this.getList();
        } else {
          this.$message.error("删除失败~~~");
        }
      } catch (error) {
        this.$message.error("请求删除失败~~~");
      }
    },
    // 点击查看spu中的sku列表
    async viewSkuList(row) {
      this.isShowViewSkuList=true
      try {
        const rel =await this.$api.sku.getListBySpuId (row.id) 
        if(rel.code===20000||rel.code===200){
          this.viewSkuValueList=rel.data
          // 储存spu名字，再table中使用
          this.skuTableName=row.spuName

        }
      } catch (error) {
        this.$message.error("请求错误~~~~")
      }
    },
  },
   // 三级联动的可操作性处理
  watch: {
    isShowSpu: {
      handler(newVal, oldVal) {
        this.isShowList = !newVal;
      }
    },

    isShowSku: {
      handler(newVal, oldVal) {
        this.isShowList = !newVal;
      }
    }
  },

};

</script>

<style>
</style>