import { EuiFormRow, type EuiFormRowProps } from '@elastic/eui'

export function FormField({
  children,
  className,
  css,
  fullWidth = true,
  ...rest
}: EuiFormRowProps) {
  return (
    <EuiFormRow
      display="row"
      fullWidth={fullWidth}
      {...rest}
      className={['cp-field', className].filter(Boolean).join(' ')}
      css={[
        css,
        {
          marginTop: 0,
          marginBottom: 0,
          display: fullWidth ? 'flex' : 'inline-flex',
          flexDirection: 'column',
          rowGap: 8,
          width: fullWidth ? '100%' : 'auto',
        },
      ]}
    >
      {children}
    </EuiFormRow>
  )
}
