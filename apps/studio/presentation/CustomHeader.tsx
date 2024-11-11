import {CheckmarkIcon, CloseIcon, EllipsisVerticalIcon} from '@sanity/icons'
import {useSharedState} from '@sanity/presentation'
import type {PreviewHeaderProps} from '@sanity/presentation'
import {Button, Menu, MenuButton, MenuItem} from '@sanity/ui'
import {useState, type FunctionComponent} from 'react'

export const CustomHeader: FunctionComponent<PreviewHeaderProps> = (props) => {
  const [enabled, setEnabled] = useState(false)

  useSharedState('overlay-enabled', enabled)

  return (
    <>
      {props.renderDefault(props)}
      <MenuButton
        button={
          <Button fontSize={1} icon={EllipsisVerticalIcon} mode="bleed" padding={2} space={2} />
        }
        id="custom-menu"
        menu={
          <Menu style={{maxWidth: 240}}>
            <MenuItem
              fontSize={1}
              icon={enabled ? CloseIcon : CheckmarkIcon}
              onClick={() => setEnabled((enabled) => !enabled)}
              padding={3}
              tone={enabled ? 'caution' : 'positive'}
              text={enabled ? 'Disable Highlighting' : 'Enable Highlighting'}
            />
          </Menu>
        }
        popover={{
          animate: true,
          constrainSize: true,
          placement: 'bottom',
          portal: true,
        }}
      />
    </>
  )
}
