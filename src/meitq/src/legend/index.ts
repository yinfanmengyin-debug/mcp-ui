import component from './index.vue'
import addOrEditColorCode from './components/addOrEditColorCode.vue'
import addOrEditColorBar from './components/v2/addOrEditColorBar.vue'
import withInstall from '@/utils/withInstall/index'

const MtLegend = withInstall(component, 'MtLegend')
const MtAddOrEditColorCode = withInstall(addOrEditColorCode, 'MtAddOrEditColorCode')
const MtAddOrEditColorBar = withInstall(addOrEditColorBar, 'MtAddOrEditColorBar')

export default MtLegend
export { MtAddOrEditColorCode, MtAddOrEditColorBar }
