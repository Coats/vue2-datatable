<template>
    <label name="PageSizeSelect">
        <label class="-page-size-label-before" style="padding-left: 10px;" :value="paginationSelectorBeforeText">{{
            paginationSelectorBeforeText }}</label>
        <select class="form-control input-sm -page-size-select" v-model="query.limit"
                @change="query.offset = 0 /* reset to the first page */">
            <option v-for="i in pageSizeOptions" :value="i">{{ i }}</option>
        </select>
        {{ paginationSelectorAfterText }}
    </label>
</template>
<script>
export default {
  name: 'PageSizeSelect',
  props: {
    query: {type: Object, required: true},
    pageSizeOptions: {type: Array, required: true},
    paginationSelectorAfterText: {type: String},
    paginationSelectorBeforeText: {type: String}
  }
}
</script>
<style>
.-page-size-select {
  display: inline-block;
  width: 65px;
}

.-page-size-label-before {
  padding-left: 10px;
}
</style>
