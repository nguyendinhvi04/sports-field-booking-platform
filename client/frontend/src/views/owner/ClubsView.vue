<template>
  <div class="clubs-view">

    <!-- Header -->
    <div class="vheader">
      <div>
        <h1 class="vtitle">Quản lý Câu lạc bộ</h1>
        <p class="vsub">Danh sách cơ sở thể thao bạn sở hữu.</p>
      </div>
      <button class="btn-primary" @click="openAdd">
        <span class="material-icons">add_circle</span> Thêm câu lạc bộ
      </button>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <div class="s-wrap">
        <span class="material-icons s-icon">search</span>
        <input v-model="q" placeholder="Tìm theo tên hoặc địa chỉ..." />
      </div>
      <select v-model="statusQ">
        <option value="all">Tất cả trạng thái</option>
        <option value="APPROVED">Hoạt động</option>
        <option value="PENDING">Chờ duyệt</option>
        <option value="REJECTED">Tạm ngưng</option>
      </select>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="grid">
      <div v-for="n in 3" :key="n" class="card"><div class="sk-img"></div><div class="sk-body"><div class="sk-l" style="width:60%"></div><div class="sk-l" style="width:40%"></div><div class="sk-l" style="width:80%"></div></div></div>
    </div>

    <!-- Grid -->
    <div v-else-if="list.length" class="grid">
      <div v-for="(c,i) in list" :key="c.id" class="card" :style="`--d:${i*70}ms`">
        <div class="cimg">
          <img :src="c.coverImageUrl || fallbackImg" :alt="c.name" />
          <span class="badge" :class="c.approvalStatus">{{ statusLabel(c.approvalStatus) }}</span>
        </div>
        <div class="cbody">
          <h3>{{ c.name }}</h3>
          <p class="meta">{{ c.district }} · {{ c.city }}</p>
          <p class="row-i"><span class="material-icons">location_on</span>{{ c.address }}</p>
          <p class="row-i" v-if="c.openingHours?.length">
            <span class="material-icons">schedule</span>
            {{ fmt(c.openingHours[0].openTime) }} – {{ fmt(c.openingHours[0].closeTime) }}
          </p>
          <div class="stats"><span class="sn">{{ c.courts?.length ?? 0 }}</span><span class="sl">Sân</span></div>
          <div class="actions">
            <button class="abtn edit" @click="openEdit(c)"><span class="material-icons">edit</span> Sửa</button>
            <button class="abtn del"  @click="openDel(c)"><span class="material-icons">delete</span></button>
            <router-link :to="`/owner/courts?clubId=${c.id}`" class="abtn manage"><span class="material-icons">sports_soccer</span> Sân</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="empty">
      <span class="material-icons">business</span>
      <h3>Chưa có câu lạc bộ</h3>
      <p>Hãy thêm cơ sở đầu tiên của bạn.</p>
      <button class="btn-primary" style="margin-top:16px" @click="openAdd"><span class="material-icons">add_circle</span> Thêm ngay</button>
    </div>

    <!-- ═══ DRAWER ADD ═══ -->
    <transition name="slide">
      <div class="overlay" v-if="showAdd" @click.self="closeAdd">
        <div class="drawer">
          <div class="dhead add-head">
            <div class="dhead-left"><span class="material-icons dhi">add_business</span><div><b>Thêm câu lạc bộ</b><small>Điền đầy đủ thông tin bên dưới</small></div></div>
            <button class="xbtn" @click="closeAdd"><span class="material-icons">close</span></button>
          </div>
          <div class="dbody">
            <div v-if="addErr.length" class="alert err"><span class="material-icons">error</span><ul><li v-for="e in addErr" :key="e">{{e}}</li></ul></div>

            <!-- Upload zone -->
            <div class="fsec">
              <div class="flabel"><span class="material-icons">image</span>Ảnh bìa câu lạc bộ</div>
              <div class="upload-mode-tabs">
                <button :class="{active: addMode==='upload'}" @click="addMode='upload'"><span class="material-icons">cloud_upload</span> Tải ảnh lên</button>
                <button :class="{active: addMode==='url'}"    @click="addMode='url'"><span class="material-icons">link</span> Nhập URL</button>
              </div>

              <template v-if="addMode==='upload'">
                <div class="uz" :class="{over:addOver, preview:addPreview, err:addUpErr}"
                  @dragover.prevent="addOver=true" @dragleave.prevent="addOver=false"
                  @drop.prevent="e=>doUpload(e.dataTransfer.files[0],'add')"
                  @click="$refs.addFile.click()">
                  <input ref="addFile" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="e=>doUpload(e.target.files[0],'add')" />
                  <template v-if="addUploading">
                    <div class="prog-wrap"><div class="prog-bar" :style="`width:${addPct}%`"></div></div>
                    <p class="uh">Đang tải lên... {{ addPct }}%</p>
                  </template>
                  <template v-else-if="addPreview">
                    <img :src="addPreview" class="prev-img" />
                    <div class="prev-ov"><span class="material-icons">photo_camera</span><span>Đổi ảnh</span></div>
                  </template>
                  <template v-else>
                    <span class="material-icons ui-big">cloud_upload</span>
                    <p class="ul">Kéo thả hoặc <strong>click chọn ảnh</strong></p>
                    <p class="uh">JPG, PNG, WEBP • Tối đa 5MB</p>
                  </template>
                </div>
                <p v-if="addUpErr" class="err-msg">{{ addUpErr }} <button class="retry" @click="$refs.addFile.click()">Thử lại</button></p>
              </template>

              <template v-else>
                <div class="url-input-wrap">
                  <span class="material-icons">link</span>
                  <input v-model="addForm.coverImageUrl" type="url" placeholder="https://example.com/image.jpg" @input="addPreviewFromUrl" />
                </div>
                <img v-if="addForm.coverImageUrl" :src="addForm.coverImageUrl" class="url-preview" @error="e=>e.target.style.display='none'" />
              </template>
            </div>

            <!-- Fields -->
            <div class="fsec">
              <div class="flabel"><span class="material-icons">info</span>Thông tin cơ bản</div>
              <div class="fgrid">
                <div class="f span2">
                  <label>Tên CLB <span class="req">*</span></label>
                  <input v-model="addForm.name" :class="{inv:addSub&&!addForm.name}" placeholder="Sân bóng Thành Phát..." />
                  <small v-if="addSub&&!addForm.name" class="err-msg">Bắt buộc</small>
                </div>
                <div class="f">
                  <label>Thành phố <span class="req">*</span></label>
                  <input v-model="addForm.city" :class="{inv:addSub&&!addForm.city}" placeholder="Đà Nẵng" />
                </div>
                <div class="f">
                  <label>Quận/Huyện <span class="req">*</span></label>
                  <input v-model="addForm.district" :class="{inv:addSub&&!addForm.district}" placeholder="Hải Châu" />
                </div>
                <div class="f span2">
                  <label>Địa chỉ <span class="req">*</span></label>
                  <input v-model="addForm.address" :class="{inv:addSub&&!addForm.address}" placeholder="123 Nguyễn Văn A..." />
                </div>
                <div class="f"><label>Số điện thoại</label><input v-model="addForm.phone" placeholder="0901 234 567" /></div>
                <div class="f"><label>Email</label><input v-model="addForm.email" type="email" placeholder="info@club.com" /></div>
                <div class="f span2"><label>Mô tả</label><textarea v-model="addForm.description" rows="3" placeholder="Giới thiệu về câu lạc bộ..."></textarea></div>
              </div>
            </div>
          </div>
          <div class="dfoot">
            <button class="btn-sec" @click="closeAdd">Hủy</button>
            <button class="btn-primary" :disabled="addLoading||addUploading" @click="submitAdd">
              <span v-if="addLoading" class="spin"></span><span class="material-icons" v-else>save</span>
              {{ addLoading ? 'Đang lưu...' : 'Thêm câu lạc bộ' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ═══ DRAWER EDIT ═══ -->
    <transition name="slide">
      <div class="overlay" v-if="showEdit" @click.self="closeEdit">
        <div class="drawer">
          <div class="dhead edit-head">
            <div class="dhead-left"><span class="material-icons dhi">edit_note</span><div><b>Chỉnh sửa</b><small>{{ editForm.name }}</small></div></div>
            <button class="xbtn" @click="closeEdit"><span class="material-icons">close</span></button>
          </div>
          <div class="dbody">
            <div v-if="editErr.length" class="alert err"><span class="material-icons">error</span><ul><li v-for="e in editErr" :key="e">{{e}}</li></ul></div>
            <div v-if="editOk" class="alert ok"><span class="material-icons">check_circle</span> Cập nhật thành công!</div>

            <!-- Upload zone edit -->
            <div class="fsec">
              <div class="flabel"><span class="material-icons">image</span>Ảnh bìa câu lạc bộ</div>
              <div class="upload-mode-tabs">
                <button :class="{active: editMode==='upload'}" @click="editMode='upload'"><span class="material-icons">cloud_upload</span> Tải ảnh lên</button>
                <button :class="{active: editMode==='url'}"    @click="editMode='url'"><span class="material-icons">link</span> Nhập URL</button>
              </div>

              <template v-if="editMode==='upload'">
                <div class="uz" :class="{over:editOver, preview:editPreview||editForm.coverImageUrl, err:editUpErr}"
                  @dragover.prevent="editOver=true" @dragleave.prevent="editOver=false"
                  @drop.prevent="e=>doUpload(e.dataTransfer.files[0],'edit')"
                  @click="$refs.editFile.click()">
                  <input ref="editFile" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="e=>doUpload(e.target.files[0],'edit')" />
                  <template v-if="editUploading">
                    <div class="prog-wrap"><div class="prog-bar" :style="`width:${editPct}%`"></div></div>
                    <p class="uh">Đang tải lên... {{ editPct }}%</p>
                  </template>
                  <template v-else-if="editPreview||editForm.coverImageUrl">
                    <img :src="editPreview||editForm.coverImageUrl" class="prev-img" />
                    <div class="prev-ov"><span class="material-icons">photo_camera</span><span>Đổi ảnh</span></div>
                  </template>
                  <template v-else>
                    <span class="material-icons ui-big">cloud_upload</span>
                    <p class="ul">Kéo thả hoặc <strong>click chọn ảnh</strong></p>
                    <p class="uh">JPG, PNG, WEBP • Tối đa 5MB</p>
                  </template>
                </div>
                <p v-if="editUpErr" class="err-msg">{{ editUpErr }} <button class="retry" @click="$refs.editFile.click()">Thử lại</button></p>
              </template>

              <template v-else>
                <div class="url-input-wrap">
                  <span class="material-icons">link</span>
                  <input v-model="editForm.coverImageUrl" type="url" placeholder="https://example.com/image.jpg" />
                </div>
                <img v-if="editForm.coverImageUrl" :src="editForm.coverImageUrl" class="url-preview" @error="e=>e.target.style.display='none'" />
              </template>
            </div>

            <!-- Fields edit -->
            <div class="fsec">
              <div class="flabel"><span class="material-icons">info</span>Thông tin cơ bản</div>
              <div class="fgrid">
                <div class="f span2"><label>Tên CLB <span class="req">*</span></label><input v-model="editForm.name" :class="{inv:editSub&&!editForm.name}" /></div>
                <div class="f"><label>Thành phố <span class="req">*</span></label><input v-model="editForm.city" /></div>
                <div class="f"><label>Quận/Huyện <span class="req">*</span></label><input v-model="editForm.district" /></div>
                <div class="f span2"><label>Địa chỉ <span class="req">*</span></label><input v-model="editForm.address" /></div>
                <div class="f"><label>Số điện thoại</label><input v-model="editForm.phone" /></div>
                <div class="f"><label>Email</label><input v-model="editForm.email" type="email" /></div>
                <div class="f span2"><label>Mô tả</label><textarea v-model="editForm.description" rows="3"></textarea></div>
              </div>
            </div>
          </div>
          <div class="dfoot">
            <button class="btn-sec" @click="closeEdit">Hủy</button>
            <button class="btn-primary" :disabled="editLoading||editUploading" @click="submitEdit">
              <span v-if="editLoading" class="spin"></span><span class="material-icons" v-else>save</span>
              {{ editLoading ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ═══ DELETE MODAL ═══ -->
    <transition name="fade">
      <div class="overlay center" v-if="showDel" @click.self="showDel=false">
        <div class="del-box">
          <div class="del-ico"><span class="material-icons">warning_amber</span></div>
          <h3>Xác nhận xóa</h3>
          <p>Bạn muốn xóa câu lạc bộ <strong>{{ delTarget.name }}</strong>?</p>
          <div class="del-acts">
            <button class="btn-sec" @click="showDel=false">Hủy</button>
            <button class="btn-danger" :disabled="delLoading" @click="submitDel">
              <span v-if="delLoading" class="spin"></span><span class="material-icons" v-else>delete_forever</span>
              {{ delLoading ? 'Đang xóa...' : 'Xóa' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { clubService } from '@/services/club.service';

const MAX = 5 * 1024 * 1024;
const TYPES = ['image/jpeg','image/png','image/webp'];
const blank = () => ({ name:'', city:'', district:'', address:'', phone:'', email:'', description:'', coverImageUrl:'' });

export default {
  name: 'OwnerClubsView',
  data() {
    return {
      clubs: [], loading: false,
      q: '', statusQ: 'all',
      fallbackImg: 'https://images.unsplash.com/photo-1575446106012-c344f5b75e13?w=600&q=80',

      // ADD
      showAdd: false, addForm: blank(), addSub: false, addLoading: false, addErr: [],
      addMode: 'upload',
      addOver: false, addPreview: null, addUploading: false, addPct: 0, addUpErr: '',

      // EDIT
      showEdit: false, editForm: {}, editSub: false, editLoading: false, editErr: [], editOk: false,
      editMode: 'upload',
      editOver: false, editPreview: null, editUploading: false, editPct: 0, editUpErr: '',

      // DELETE
      showDel: false, delTarget: {}, delLoading: false,
    };
  },
  computed: {
    list() {
      const q = this.q.toLowerCase();
      return this.clubs.filter(c => {
        const ms = c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q);
        const mt = this.statusQ === 'all' || c.approvalStatus === this.statusQ;
        return ms && mt;
      });
    }
  },
  mounted() { this.load(); },
  methods: {
    statusLabel(s) { return {APPROVED:'Hoạt động',PENDING:'Chờ duyệt',REJECTED:'Tạm ngưng'}[s] || s; },
    fmt(t) {
      if (!t) return '--:--';
      const d = new Date(t);
      return isNaN(d) ? t.slice(0,5) : d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
    },

    async load() {
      this.loading = true;
      try { const r = await clubService.Getallthedetails(); if (r.data.success) this.clubs = r.data.data || []; }
      catch(e) { console.error(e); }
      finally { this.loading = false; }
    },

    // ── UPLOAD ────────────────────────────────────────────────
    async doUpload(file, ctx) {
      if (!file) return;
      const isAdd = ctx === 'add';
      const errKey = isAdd ? 'addUpErr' : 'editUpErr';
      const pctKey = isAdd ? 'addPct'   : 'editPct';
      const prevKey= isAdd ? 'addPreview': 'editPreview';
      const upKey  = isAdd ? 'addUploading':'editUploading';

      if (!TYPES.includes(file.type)) { this[errKey] = 'Chỉ chấp nhận JPG, PNG, WEBP.'; return; }
      if (file.size > MAX)            { this[errKey] = 'File vượt quá 5MB.'; return; }

      this[errKey] = '';
      this[prevKey] = URL.createObjectURL(file);
      this[upKey] = true;
      this[pctKey] = 0;

      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('type', 'club-cover');
        if (!isAdd && this.editForm.id) fd.append('entityId', this.editForm.id);

        const res = await clubService.uploadImage(fd, pct => { this[pctKey] = pct; });
        if (res.data.success) {
          const url = res.data.data.url;
          if (isAdd) this.addForm.coverImageUrl = url;
          else       this.editForm.coverImageUrl = url;
        } else {
          this[errKey] = res.data.message || 'Upload thất bại.';
          this[prevKey] = null;
        }
      } catch(e) {
        const msg = e.response?.data?.message || e.message || 'Upload thất bại.';
        this[errKey] = msg;
        this[prevKey] = null;
      } finally { this[upKey] = false; }
    },

    // ── ADD ───────────────────────────────────────────────────
    openAdd() {
      this.addForm = blank(); this.addSub = false; this.addErr = [];
      this.addPreview = null; this.addUpErr = ''; this.addMode = 'upload';
      this.showAdd = true; document.body.style.overflow = 'hidden';
    },
    closeAdd() { this.showAdd = false; document.body.style.overflow = ''; },
    async submitAdd() {
      this.addSub = true;
      if (!this.addForm.name || !this.addForm.city || !this.addForm.district || !this.addForm.address) return;
      this.addLoading = true; this.addErr = [];
      try {
        const r = await clubService.addClub(this.buildPayload(this.addForm));
        if (r.data.success) { this.clubs.unshift(r.data.data); this.closeAdd(); }
      } catch(e) {
        const fe = e.response?.data?.errors;
        this.addErr = fe ? Object.values(fe).flat() : [e.response?.data?.message || 'Có lỗi xảy ra.'];
      } finally { this.addLoading = false; }
    },

    // ── EDIT ──────────────────────────────────────────────────
    openEdit(c) {
      this.editForm = { id:c.id, name:c.name||'', city:c.city||'', district:c.district||'',
        address:c.address||'', phone:c.phone||'', email:c.email||'',
        description:c.description||'', coverImageUrl:c.coverImageUrl||'' };
      this.editSub = false; this.editErr = []; this.editOk = false;
      this.editPreview = null; this.editUpErr = ''; this.editMode = 'upload';
      this.showEdit = true; document.body.style.overflow = 'hidden';
    },
    closeEdit() { this.showEdit = false; document.body.style.overflow = ''; },
    async submitEdit() {
      this.editSub = true;
      if (!this.editForm.name || !this.editForm.city || !this.editForm.district || !this.editForm.address) return;
      this.editLoading = true; this.editErr = []; this.editOk = false;
      try {
        const r = await clubService.editClub(this.editForm.id, this.buildPayload(this.editForm));
        if (r.data.success) {
          const idx = this.clubs.findIndex(c => c.id === this.editForm.id);
          if (idx !== -1) this.clubs[idx] = { ...this.clubs[idx], ...r.data.data };
          this.editOk = true;
          setTimeout(() => this.closeEdit(), 1200);
        }
      } catch(e) {
        const fe = e.response?.data?.errors;
        this.editErr = fe ? Object.values(fe).flat() : [e.response?.data?.message || 'Có lỗi xảy ra.'];
      } finally { this.editLoading = false; }
    },

    // ── DELETE ────────────────────────────────────────────────
    openDel(c) { this.delTarget = { id:c.id, name:c.name }; this.showDel = true; },
    async submitDel() {
      this.delLoading = true;
      try {
        const r = await clubService.deleteClub(this.delTarget.id);
        if (r.data.success) { this.clubs = this.clubs.filter(c => c.id !== this.delTarget.id); this.showDel = false; }
      } catch(e) { alert('Xóa thất bại.'); }
      finally { this.delLoading = false; }
    },

    buildPayload(f) {
      const p = {};
      ['name','city','district','address','phone','email','description','coverImageUrl']
        .forEach(k => { if (f[k] !== undefined && f[k] !== '') p[k] = f[k]; });
      return p;
    },
    addPreviewFromUrl() { /* preview handled by v-if */ },
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

*{box-sizing:border-box;}
.clubs-view{font-family:'Be Vietnam Pro',sans-serif;color:#0f172a;}

/* Header */
.vheader{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;flex-wrap:wrap;gap:12px;}
.vtitle{font-size:24px;font-weight:800;margin:0 0 3px;}
.vsub{font-size:14px;color:#64748b;margin:0;}

/* Buttons */
.btn-primary{display:inline-flex;align-items:center;gap:7px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;border:none;padding:11px 20px;border-radius:11px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;box-shadow:0 4px 12px rgba(22,163,74,.3);transition:all .2s;}
.btn-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 7px 18px rgba(22,163,74,.4);}
.btn-primary:disabled{opacity:.6;cursor:not-allowed;}
.btn-sec{flex:1;padding:11px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit;transition:.2s;}
.btn-sec:hover{background:#f8fafc;}
.btn-danger{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:11px;border-radius:10px;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;box-shadow:0 4px 12px rgba(239,68,68,.3);transition:.2s;}
.btn-danger:hover:not(:disabled){transform:translateY(-1px);}
.btn-danger:disabled{opacity:.6;cursor:not-allowed;}

/* Search */
.search-bar{display:flex;gap:12px;margin-bottom:22px;flex-wrap:wrap;}
.s-wrap{flex:1;position:relative;min-width:180px;}
.s-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:20px;}
.s-wrap input{width:100%;padding:11px 12px 11px 42px;border:1px solid #e2e8f0;border-radius:11px;font-family:inherit;font-size:14px;background:#f8fafc;}
.s-wrap input:focus{outline:none;border-color:#16a34a;background:#fff;}
.search-bar select{padding:11px 14px;border:1px solid #e2e8f0;border-radius:11px;background:#f8fafc;font-family:inherit;font-size:14px;cursor:pointer;}

/* Grid */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;}
.card{background:#fff;border-radius:18px;border:1px solid #eaecf2;overflow:hidden;transition:.3s;animation:su .45s ease both;animation-delay:var(--d,0ms);}
.card:hover{transform:translateY(-5px);box-shadow:0 12px 32px rgba(0,0,0,.07);}
@keyframes su{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

.cimg{position:relative;height:180px;overflow:hidden;}
.cimg img{width:100%;height:100%;object-fit:cover;transition:.4s;}
.card:hover .cimg img{transform:scale(1.05);}
.badge{position:absolute;top:10px;right:10px;font-size:11px;font-weight:700;padding:4px 11px;border-radius:100px;}
.badge.APPROVED{background:rgba(22,163,74,.88);color:#fff;}
.badge.PENDING{background:rgba(234,179,8,.9);color:#fff;}
.badge.REJECTED{background:rgba(239,68,68,.88);color:#fff;}

.cbody{padding:16px 18px 14px;}
.cbody h3{font-size:16px;font-weight:800;margin:0 0 3px;}
.meta{font-size:12px;color:#64748b;margin:0 0 10px;}
.row-i{display:flex;align-items:center;gap:6px;font-size:13px;color:#475569;margin:0 0 6px;}
.row-i .material-icons{font-size:15px;color:#94a3b8;}
.stats{margin:12px 0;display:flex;gap:16px;}
.sn{display:block;font-size:20px;font-weight:800;color:#1e293b;}
.sl{font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;}
.actions{display:flex;gap:8px;flex-wrap:wrap;}
.abtn{height:34px;padding:0 12px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;display:inline-flex;align-items:center;gap:5px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:.2s;text-decoration:none;color:#1e293b;}
.abtn .material-icons{font-size:14px;}
.abtn.edit:hover{background:#eff6ff;border-color:#bfdbfe;color:#1d4ed8;}
.abtn.del{color:#ef4444;padding:0 10px;}
.abtn.del:hover{background:#fef2f2;border-color:#fecaca;}
.abtn.manage{flex:1;justify-content:center;background:#f0fdf4;border-color:#bbf7d0;color:#16a34a;}
.abtn.manage:hover{background:#dcfce7;}

/* Skeleton */
.sk-img{height:180px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200%;animation:sh 1.4s infinite;}
.sk-body{padding:16px;}
.sk-l{height:13px;border-radius:5px;margin-bottom:9px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200%;animation:sh 1.4s infinite;}
@keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* Empty */
.empty{text-align:center;padding:70px 20px;background:#fff;border-radius:18px;border:2px dashed #eaecf2;}
.empty .material-icons{font-size:56px;color:#cbd5e1;display:block;margin-bottom:10px;}
.empty h3{font-size:18px;font-weight:700;margin:0 0 7px;}
.empty p{font-size:14px;color:#64748b;margin:0;}

/* Overlay / Drawer */
.overlay{position:fixed;inset:0;z-index:1050;background:rgba(0,0,0,.48);backdrop-filter:blur(3px);display:flex;justify-content:flex-end;}
.overlay.center{justify-content:center;align-items:center;}
.drawer{width:490px;max-width:100vw;background:#fff;display:flex;flex-direction:column;height:100%;box-shadow:-6px 0 36px rgba(0,0,0,.13);}

.dhead{padding:20px 22px 16px;display:flex;justify-content:space-between;align-items:center;}
.add-head{background:linear-gradient(135deg,#0f172a,#1e3a5f);}
.edit-head{background:linear-gradient(135deg,#1e3a5f,#2563eb);}
.dhead-left{display:flex;align-items:center;gap:12px;}
.dhi{font-size:26px;color:rgba(255,255,255,.85);}
.dhead-left b{display:block;font-size:17px;font-weight:800;color:#fff;margin-bottom:2px;}
.dhead-left small{font-size:12px;color:rgba(255,255,255,.6);}
.xbtn{background:rgba(255,255,255,.12);border:none;border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;transition:.2s;}
.xbtn:hover{background:rgba(255,255,255,.22);}

.dbody{flex:1;overflow-y:auto;padding:20px 22px;}
.dfoot{padding:14px 22px;border-top:1px solid #f1f5f9;display:flex;gap:12px;}

/* Form */
.fsec{margin-bottom:20px;}
.flabel{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #f1f5f9;}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.f{display:flex;flex-direction:column;gap:5px;}
.f.span2{grid-column:1/-1;}
.f label{font-size:13px;font-weight:600;color:#374151;}
.f input,.f textarea,.f select{padding:10px 12px;border:1px solid #e2e8f0;border-radius:9px;font-family:inherit;font-size:14px;background:#f8fafc;transition:.2s;}
.f input:focus,.f textarea:focus{outline:none;border-color:#16a34a;background:#fff;box-shadow:0 0 0 3px rgba(22,163,74,.08);}
.f input.inv{border-color:#ef4444;}
.f textarea{resize:vertical;}
.req{color:#ef4444;}
.err-msg{font-size:12px;color:#ef4444;margin:4px 0 0;}

/* Upload */
.upload-mode-tabs{display:flex;gap:6px;margin-bottom:12px;}
.upload-mode-tabs button{flex:1;padding:9px 8px;border:1px solid #e2e8f0;border-radius:9px;background:#f8fafc;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:.2s;color:#64748b;}
.upload-mode-tabs button .material-icons{font-size:16px;}
.upload-mode-tabs button.active{background:#16a34a;color:#fff;border-color:#16a34a;}

.uz{border:2px dashed #e2e8f0;border-radius:13px;min-height:160px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:.25s;background:#f8fafc;position:relative;overflow:hidden;padding:20px;}
.uz:hover,.uz.over{border-color:#16a34a;background:#f0fdf4;}
.uz.preview{padding:0;border-style:solid;border-color:#16a34a;}
.uz.err{border-color:#ef4444;}
.ui-big{font-size:42px;color:#cbd5e1;margin-bottom:8px;}
.ul{font-size:14px;font-weight:600;color:#475569;margin:0 0 4px;}
.ul strong{color:#16a34a;}
.uh{font-size:12px;color:#94a3b8;margin:0;}
.prev-img{width:100%;height:190px;object-fit:cover;display:block;}
.prev-ov{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#fff;opacity:0;transition:.2s;border-radius:11px;}
.uz:hover .prev-ov{opacity:1;}
.prev-ov .material-icons{font-size:26px;}
.prev-ov span:last-child{font-size:13px;font-weight:600;}

/* Progress */
.prog-wrap{width:80%;height:7px;background:#e2e8f0;border-radius:100px;overflow:hidden;margin-bottom:10px;}
.prog-bar{height:100%;background:linear-gradient(90deg,#16a34a,#22c55e);border-radius:100px;transition:width .15s;}

/* URL input */
.url-input-wrap{display:flex;align-items:center;gap:8px;border:1px solid #e2e8f0;border-radius:9px;padding:0 12px;background:#f8fafc;margin-bottom:10px;}
.url-input-wrap .material-icons{color:#94a3b8;font-size:18px;}
.url-input-wrap input{flex:1;border:none;background:transparent;padding:11px 0;font-family:inherit;font-size:14px;}
.url-input-wrap input:focus{outline:none;}
.url-preview{width:100%;max-height:160px;object-fit:cover;border-radius:9px;}
.retry{background:none;border:none;color:#16a34a;font-weight:700;cursor:pointer;font-family:inherit;font-size:12px;text-decoration:underline;padding:0;margin-left:6px;}

/* Alert */
.alert{display:flex;align-items:flex-start;gap:9px;padding:11px 13px;border-radius:9px;margin-bottom:16px;font-size:13px;}
.alert.err{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;}
.alert.ok{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;}
.alert .material-icons{font-size:18px;flex-shrink:0;}
.alert ul{margin:0;padding-left:14px;}

/* Delete modal */
.del-box{background:#fff;border-radius:18px;padding:30px 26px;width:380px;max-width:90vw;text-align:center;box-shadow:0 20px 56px rgba(0,0,0,.18);animation:pop .22s ease;}
@keyframes pop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
.del-ico{width:58px;height:58px;border-radius:50%;background:#fef2f2;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;}
.del-ico .material-icons{font-size:28px;color:#ef4444;}
.del-box h3{font-size:17px;font-weight:700;margin:0 0 8px;}
.del-box p{font-size:14px;color:#6b7280;margin:0 0 22px;line-height:1.6;}
.del-acts{display:flex;gap:12px;}

/* Spinner */
.spin{width:15px;height:15px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:sp .7s linear infinite;}
@keyframes sp{to{transform:rotate(360deg)}}

/* Transitions */
.slide-enter-active,.slide-leave-active{transition:opacity .28s;}
.slide-enter-active .drawer,.slide-leave-active .drawer{transition:transform .28s cubic-bezier(.4,0,.2,1);}
.slide-enter-from,.slide-leave-to{opacity:0;}
.slide-enter-from .drawer,.slide-leave-to .drawer{transform:translateX(100%);}
.fade-enter-active,.fade-leave-active{transition:opacity .2s;}
.fade-enter-from,.fade-leave-to{opacity:0;}

@media(max-width:640px){.vheader{flex-direction:column;align-items:flex-start;}.grid{grid-template-columns:1fr;}.drawer{width:100vw;}.fgrid{grid-template-columns:1fr;}.f.span2{grid-column:1;}}
</style>