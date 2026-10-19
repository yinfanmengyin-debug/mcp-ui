import dayjs from 'dayjs'
import houOfYear from '@/libs/dayjs/plugins/houOfYear'
import xunOfYear from '@/libs/dayjs/plugins/xunOfYear'
import seasonOfYear from '@/libs/dayjs/plugins/seasonOfYear'
import MtCheckbox from './checkbox'
import MtCheckButton from './checkButton'
import MtTimeAxis from './timeAxis'
import MtSelection from './selection'
import MtDatePicker from './datePicker'
import MtRadio from './radio'
import MtListView from './listView'

import MtLegend from './legend'
import { MtAddOrEditColorCode, MtAddOrEditColorBar } from './legend'

import MtConfigProvider from './configProvider'
import MtFormItem from './formItem'
import MtFormBlock from './formBlock'
import MtPageLayout from './pageLayout'
import MtAreaSelector from './areaSelector'
import MtEmpty from './empty'
import MtChart from './chart'
import MtTable from './table'
import MtPageOffice from './pageOffice'

import { useFullscreen } from '@/hooks/useFullscreen'

dayjs.extend(houOfYear)
dayjs.extend(xunOfYear)
dayjs.extend(seasonOfYear)

const Version = '1.0.1'

export {
  dayjs,
  MtCheckbox,
  MtCheckButton,
  MtTimeAxis,
  MtSelection,
  MtDatePicker,
  MtRadio,
  MtListView,
  MtLegend,
  MtConfigProvider,
  MtFormItem,
  MtFormBlock,
  MtPageLayout,
  MtAreaSelector,
  MtEmpty,
  MtAddOrEditColorCode,
  MtAddOrEditColorBar,
  MtChart,
  MtTable,
  MtPageOffice,
  Version,
  useFullscreen
}
