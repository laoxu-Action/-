<template>
  <div>
    <!-- 添加按钮 -->
    <el-button type="primary" icon="el-icon-plus" @click="addList" round
      >添加</el-button
    >

    <el-table :data="records" border style="width: 100%; margin: 20px 0">
      <el-table-column type="index" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO" width="width">
        <template v-slot="{ row }">
          <div>
            <img :src="row.logoUrl" style="width: 100px; height: 100px" />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="width">
        <template v-slot="{ row }">
          <div>
            <el-button
              type="warning"
              icon="el-icon-edit"
              @click="butClick(row)"
              round
              >修改</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="open(row)"
              round
              >删除</el-button
            >
          </div>
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
      layout="prev, pager, next,->, jumper,sizes,total"
      :total="total"
    >
    </el-pagination>

    <!-- 添加修改弹框 -->
    <el-dialog title="添加商品" :visible.sync="dialogFormVisible">
      <!-- 品牌输入框 -->
      <el-form :model="trademark" :rules="rules">
        <el-form-item label="商品名称" label-width="100px" prop="tmName">
          <el-input autocomplete="off" v-model="trademark.tmName"></el-input>
        </el-form-item>
        <!-- 上传图片 -->
        <el-form-item label="品牌LOGO" label-width="100px">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img
              v-if="trademark.logoUrl"
              :src="trademark.logoUrl"
              class="avatar"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <!-- 确定，取消按钮 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUpDataList">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "trademark",
  data() {
    return {
      page: 1, //当前页码
      limit: 3, //每页数量
      total: 0, //总数量
      trademark: {
        logoUrl: "", //图片路径
        tmName: "", //商品名称
      },
      records: [],
      dialogFormVisible: false, //弹框显示与隐藏
      rules: {
        //添加修改的表单验证
        tmName: [
          { required: true, message: "请输入活动名称", trigger: "change" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "change",
          },
        ],
      },
    };
  },
  mounted() {
    // 请求列表数据
    this.obtainListData();
  },
  methods: {
    // 请求列表数据
    async obtainListData() {
      try {
        const rel = await this.$api.trademark.pagingList(this.page, this.limit);
        if (rel.code === 2000 || rel.code === 200) {
          this.total = rel.data.total;
          this.records = rel.data.records;
        } else {
          this.$alert.danger("参数不正确");
        }
      } catch (error) {
        this.$alert.danger("请求不正确");
      }
    },
    // 添加,修改
    async addUpDataList() {
      this.dialogFormVisible = false;
      try {
        const rel = await this.$api.trademark.addUpData(this.trademark);
        if (rel.code === 20000 || rel.code === 200) {
          this.$message.success(this.trademark.id ? "修改成功" : "添加成功");
          // 根据是修改还是添加跳转
          this.obtainListData(this.trademark.id ? "" : (this.page = 1));
        }
      } catch (error) {}
    },
    // 点击添加
    addList() {
      this.dialogFormVisible = true;
      this.trademark = {
        logoUrl: "", //图片路径
        tmName: "", //商品名称
      };
    },
    // 点击修改
    butClick(row) {
      this.dialogFormVisible = true;
      // 浅拷贝trademark
      this.trademark = { ...row };
    },
    // 图片接受成功回调
    handleAvatarSuccess(res, file) {
      this.trademark.logoUrl = res.data;
    },
    // 图片发送之前回调
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    // 连续页发生改变，重新发请求
    handleSizeChange() {
      this.obtainListData();
    },
    // 当前页发生改变，重新发请求
    handleCurrentChange() {
      this.obtainListData();
    },
    // 点击删除
    open(row) {
      this.$confirm("确定要删除嘛?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
      })
        .then(async () => {
          try {
            const rel = await this.$api.trademark.delete(row.id);
            if (rel.code === 20000 || rel.code === 200) {
              this.$message({
                type: "success",
                message: "删除成功~~~!",
              });
              this.obtainListData();
            }else{
              this.$message.warning("删除失败~~~");

            }
          } catch (error) {
            this.$message.warning("请求删除失败~~~");
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>