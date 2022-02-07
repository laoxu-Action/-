<template>
  <div>
    <el-card shadow="always" style="margin: 20px">
      <FormInline @changeListId="changeListId" :isShow="isShow"></FormInline>
    </el-card>
    <el-card shadow="always" style="margin: 20px">
      <!-- 表格 -->
      <div v-show="isShow">
        <el-button type="primary" @click.prevent="addAttributes" :disabled="!propertyList.length"
          >添加属性</el-button
        >
        <el-table :data="propertyList" border style="width: 100%">
          <el-table-column
            prop="date"
            type="index"
            label="序号"
            width="80"
            align="center"
          >
          </el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="100">
          </el-table-column>
          <el-table-column prop="prop" label="属性值列表">
            <!-- 作用域插槽，遍历 -->
            <template v-slot="{ row }">
              <el-tag
                type="success"
                v-for="item in row.attrValueList"
                :key="item.id"
                >{{ item.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template v-slot="{ row }">
              <div>
                <HintButton
                  title="修改"
                  type="primary"
                  icon="el-icon-edit"
                  @click="modifyProperties(row)"
                  
                  circle
                ></HintButton>
                <el-popconfirm
                  :title="`确定删除${row.attrName}嘛?`"
                  @onConfirm="delAttrForm(row)"
                  
                >
                  <HintButton
                    title="删除"
                    type="danger"
                    icon="el-icon-delete"
                    slot="reference"
                    circle
                  ></HintButton>
                </el-popconfirm>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 添加表格 -->
      <div v-show="!isShow">
        <el-form :inline="true" :model="attrForm" class="demo-form-inline">
          <el-form-item label="属性名">
            <el-input
              placeholder="请输入属性名"
              v-model="attrForm.attrName"
            ></el-input>
          </el-form-item>
        </el-form>

        <el-button type="primary" @click="addAttrForm">添加属性</el-button>
        <el-button @click="isShow = true">取消</el-button>

        <el-table border style="width: 100%" :data="attrForm.attrValueList">
          <el-table-column
            prop="date"
            type="index"
            label="序号"
            align="center"
            width="100"
          >
          </el-table-column>
          <el-table-column prop="name" label="属性名称">
            <template slot-scope="{ row, $index }">
              <el-input
                size="mini"
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                v-if="row.isTrue"
                @blur="keyTyp(row)"
                @keyup.enter.native="keyTyp(row)"
                :ref="$index"
              ></el-input>
              <span
                v-else
                @click="focusOf(row, $index)"
                style="display: block; width: 100%"
                >{{ row.valueName }}</span
              >
            </template>
          </el-table-column>
          <el-table-column prop="address" label="操作">
            <template v-slot="{ row }">
              <div>
                <el-popconfirm :title="`确定删除${row.valueName}嘛?`" @onConfirm="delAttrValueList(row)">
                  <HintButton
                    title="删除"
                    type="danger"
                    icon="el-icon-delete"
                    slot="reference"
                    
                    circle
                  ></HintButton>
                </el-popconfirm>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="success" @click="save">保存</el-button>
        <el-button @click="isShow = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      propertyList: [], //属性列表
      isShow: true,
      attrForm: {
        attrName: "",
        attrValueList: [],
        categoryId: 0,
        categoryLevel: 3,
      },
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
    // 获取列表propertyList数据
    async getList() {
      let { category1Id, category2Id, category3Id } = this;
      try {
        const rel = await this.$api.attr.getList({
          category1Id,
          category2Id,
          category3Id,
        });
        if (rel.code === 20000 || rel.code === 200) {
          this.propertyList = rel.data;
        } else {
          this.$message.error("获取列表失败~~");
        }
      } catch (error) {
        this.$message.error("请求列表失败~~");
      }
    },
    // 点击主页面添加属性
    addAttributes() {
      this.isShow = false;
      // 每次点击添加重置attrForm，给categoryId赋值，让后端知道是给谁添加
      this.attrForm = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3,
      };
    },
    // 点击新添加input
    addAttrForm() {
      this.attrForm.attrValueList.push({
        valueName: "",
        id: this.attrForm.id,
        isTrue: true,
      });
      // 获取焦点
      this.$nextTick(() => {
        this.$refs[this.attrForm.attrValueList.length - 1].focus();
      });
    },
    // 主页面修改属性
    modifyProperties(row) {
      this.isShow = false;
      // 因为用户修改，有可能取消修改，所以不能让他修改row
      // 使用深拷贝
      let arr = cloneDeep(row);
      // 把要修改的属性值赋值给修改页显示
      this.attrForm = { ...arr };
      this.attrForm.attrValueList.forEach((item) => {
        // 给对象新加属性所用用$set
        this.$set(item, "isTrue", false);
      });
    },
    // input框输入完成
    keyTyp(row) {
      // 如果用户输入的全为空格，则清空
      if (row.valueName.trim() === "") {
        row.valueName = "";
        return;
      }
      let arr = this.attrForm.attrValueList;
      // 遍历attrValueList，看输入的属性值之前有没有
      let rel = arr.some((item) => {
        if (item !== row) {
          // 重复了就退出
          return row.valueName === item.valueName;
        }
      });
      if (rel) {
        this.$message.error("属性值不能重复~~~");
        row.valueName = "";
      }
      row.isTrue = false;
    },
    // 点击span给input获得焦点
    focusOf(row, $index) {
      row.isTrue = true;
      // 因为要等DOM渲染完成再添加焦点
      this.$nextTick(() => {
        this.$refs[$index].focus();
      });
    },
    // 保存
    async save() {
      // 过滤attrValueList
      this.attrForm.attrValueList = this.attrForm.attrValueList.filter(
        (item) => {
          // 过滤掉valueName为空的
          if (item.valueName.trim() !== "") {
            // 删除isTrue属性
            delete item.isTrue;
            return item;
          }
        }
      );
      try {
        const rel = await this.$api.attr.save(this.attrForm);
        if (rel.code === 20000 || rel.code === 200) {
          // 跳转至属性管理主页面列表
          this.isShow = true;
          // 重新获取列表
          this.getList();
        } else {
          this.$message.error("保存失败~~");
        }
      } catch (error) {
        this.$message.error("请求保存失败~~");
      }
    },
    // 删除主页面的属性
    async delAttrForm(row) {
      try {
        const rel = await this.$api.attr.delAttrForm(row.id);
        if (rel.code === 20000 || rel.code === 200) {
          this.$message.success("删除成功~~");
          // 重新获取列表
          this.getList();
        } else {
          this.$message.error("删除失败~~");
        }
      } catch (error) {
        this.$message.error("请求删除失败~~");
      }
    },
    // 删除属性值列表
    delAttrValueList(row){
     this.attrForm.attrValueList=this.attrForm.attrValueList.filter(item=>{
        return item!==row
      })
    }
  },
};
</script>

<style>
</style>