<template>
  <div>
    <code>query: {{ query }}</code>
    <datatable v-bind="$data" />
  </div>
</template>
<script>
import mockData from '../_mockData'
import dnd from '../../../plugins/HeaderSettingsDnD'

export default {
  data: () => ({
    columns: [
      { title: 'User ID', field: 'uid', sortable: true },
      { title: 'Username', field: 'name' },
      { title: 'Age', field: 'age', sortable: true },
      { title: 'Email', field: 'email' },
      { title: 'Country', field: 'country' }
    ],
    data: [],
    total: 0,
    query: {}
  }),
  mounted () {
    dnd(this)
  },
  watch: {
    query: {
      handler (query) {
        mockData(query).then(({ rows, total }) => {
          this.data = rows
          this.total = total
        })
      },
      deep: true
    }
  }
}
</script>
