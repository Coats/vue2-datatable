/**
 * apply drag-and-drop sortable feature to HeaderSettings
 * note that this function should be invoked in `mounted`
 * e.g.
  <template>
    <datatable v-bind="$data">
  </template>
  <script>
  import dnd from 'vue2-datatable-component/plugins/HeaderSettingsDnD'

  export default {
    mounted () {
      dnd(this) // done!
    },
    ...
  }
  </script>

 * `vm.columns` should also meet the requirement that:
 * the same-group columns should be put together
 * e.g.
  [ // ok
    { field: 'a1', group: 'A' },
    { field: 'a2', group: 'A' },
    { field: 'b1', group: 'B' },
    { field: 'b2', group: 'B' },
    { field: 'c1', group: 'C' },
    { field: 'c2', group: 'C' }
  ]
  [ // not ok
    { field: 'a1', group: 'A' },
    { field: 'b1', group: 'B' },
    { field: 'c1', group: 'C' },
    { field: 'a2', group: 'A' },
    { field: 'b2', group: 'B' },
    { field: 'c2', group: 'C' }
  ]

 * @param {VueInstance} vm
 */
export default function dnd(vm) {
  const $TheadContainer = $(vm.$el).find('thead')
  const $TbodyContainer = $(vm.$el).find('tbody')
  const DRAGGABLE = 'th[draggable=true]'
  const DROP_ZONE = 'th.-col-drop-zone'

  /** generates <th> element with class '-col-drop-zone' */
  function dropZoneGen(idx) {
    return `<th class="-col-drop-zone" target-idx="${idx}"></th>`
  }

  /** generates extra <td> with class 'temp' */
  function extraSpaceTdGen(idx) {
    return `<td class="temp" target-idx="${idx}"></td>`
  }

  /** sets <th> elements draggable true and maps the attr 'source-idx' according to the column it
    represents; useful when hiding certain columns without affecting drag reorder */
  function setDraggableThAndMapIdx() {
    let {columns} = vm
    $TheadContainer.find('th').each(function() {
      let $this = $(this)

      let textValue = $this.text().trim()
      let index = columns.findIndex(function(el) {
        return el.title === textValue
      })

      $this.attr('draggable', true)
      $this.attr('source-idx', index)
    })
  }

  /** generate adjacent drop zones for each column displayed as <th> */
  function generateDropZones() {
    $TheadContainer
      .find(DROP_ZONE).remove().end() // ensure no drop zone exists
      .find('th').each(function () {
        const $this = $(this)
        let idx = $this.attr('source-idx')
        $this
          .before(
            dropZoneGen(
              $this.is('th:first-of-type') ? idx - 0.25 : idx
            )
          )

        $this.is('th:last-of-type') && $this.after(dropZoneGen(idx + 0.25))
      })
    /** also generate empty <td> elements on the body for header-column match */
    $TbodyContainer
      .find('td').each(function () {
        const $this = $(this)
        $this
          .before(extraSpaceTdGen())
      })
  }

  /** removes generated <th> elements on the header and also body empty <td> */
  function removeDropZones() {
    $TheadContainer.find(DROP_ZONE).remove()
    $TbodyContainer.find('.temp').remove()
  }

  vm.$watch('columns', () => {
    vm.$nextTick(setDraggableThAndMapIdx)
  }, {immediate: true, deep: true})

  /**  ↑↑↑ preparatory work --- main logic ↓↓↓ ***/
  let draggingIdx = null

  $.fn.isAllowedToDrop = function () {
    const targetIdx = +$(this).attr('target-idx')
    return ![-0.25, 0, 0.25, 1].includes(targetIdx - draggingIdx) // filter adjacent drop zones
  }

  $TheadContainer
    .on('dragstart', DRAGGABLE, function () {
      generateDropZones()
      draggingIdx = +$(this).addClass('-dragging').attr('source-idx')
    })
    .on('dragend', DRAGGABLE, function () {
      draggingIdx = null
      $(this).removeClass('-dragging')
      removeDropZones()
    })
    .on('dragover', DROP_ZONE, function (e) {
      e.preventDefault() // must
      e.originalEvent.dataTransfer.dropEffect = $(this).isAllowedToDrop() ? 'move' : 'none'
    })
    .on('dragenter', DROP_ZONE, function () {
      const $this = $(this)
      $this.isAllowedToDrop() && $this.addClass('-droppable')
    })
    .on('drop', DROP_ZONE, function () {
      const $this = $(this).removeClass('-droppable')
      if (!$this.isAllowedToDrop()) return

      const { columns } = vm
      const targetIdx = +$this.attr('target-idx')

      arrMove(columns, draggingIdx, Math.ceil(targetIdx))
      removeDropZones()
    })
    .on('dragleave', DROP_ZONE, function () {
      const $this = $(this)
      $this.isAllowedToDrop() && $this.removeClass('-droppable')
    })
}

// similar to https://github.com/sindresorhus/array-move
function arrMove(arr, from, to) {
  arr.splice((from < to ? to - 1 : to), 0, arr.splice(from, 1)[0])
}

$('head').append(`<style>
  .-col-group > [draggable],
  .-col-group > .-col-drop-zone {
    margin-bottom: 0;
  }
  .-dragging {
    opacity: 0.3;
  }
  .-col-drop-zone {
    height: 10px;    
    background: lightgray;
    transition: height .25s ease;
  }
  .-col-drop-zone:hover {
    background: #337ab7;
    transition: background .5s;
  }
  .-droppable {
    height: 30px;
    border: 1px dashed #ddd;
    border-radius: 4px;
    background: #337ab7;
    -webkit-transition: .4s;
    -moz-transition: .4s;
    -ms-transition: .4s;
    -o-transition: .4s;
    transition: .4s;
  }
  th[draggable=true] {
  cursor: move;
  z-index: 100;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;  
  }  
</style>`)
