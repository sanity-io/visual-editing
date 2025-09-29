import {Box, Select} from '@sanity/ui'
import {useCallback} from 'react'
import {set, type InputProps, unset} from 'sanity'

/**
 * Custom input component for audience selection that reads from sanity.config
 */
export function AudienceSelectInput(props: InputProps) {
  const {value, onChange} = props

  // For now, provide a fallback set of audiences
  // TODO: This should ideally read from the workspace config when available
  const audiences = [
    'general',
    'premium',
    'enterprise',
    'beta-users',
  ]

  const handleChange = useCallback((selectedValue: string) => {
    if (selectedValue) {
      onChange(set(selectedValue))
    } else {
      onChange(unset())
    }
  }, [onChange])

  const handleSelectChange = useCallback((event: {currentTarget: {value: string}}) => {
    handleChange(event.currentTarget.value)
  }, [handleChange])

  return (
    <Box>
      <Select
        value={(typeof value === 'string' ? value : '') || ''}
        onChange={handleSelectChange}
        placeholder="Select an audience..."
      >
        <option value="">Select an audience...</option>
        {audiences.map((audience) => (
          <option key={audience} value={audience}>
            {audience}
          </option>
        ))}
      </Select>
    </Box>
  )
}
