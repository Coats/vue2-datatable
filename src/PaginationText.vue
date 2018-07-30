<template>
    <strong name="PaginationText">
        {{ getPageInfo }}
    </strong>
</template>
<script>
export default {
  name: 'PaginationText',
  props: {
    total: {type: Number, required: true},
    query: {type: Object, required: true},
    paginationInfoText: {type: String}
  },
  computed: {
    totalPage() {
      return Math.ceil(this.total / +this.query.limit)
    },
    curPage() {
      return Math.ceil(+this.query.offset / +this.query.limit) + 1
    },
    getPageInfo() {
      let info = this.paginationInfoText.replace('_PAGENO_', this.curPage).replace('_TOTALPAGES_', this.totalPage)
      return info
    }
  },
  methods: {}
}
</script>
