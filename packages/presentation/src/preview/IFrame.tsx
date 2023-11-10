import { motion } from 'framer-motion'
import styled from 'styled-components'

export const IFrame = motion(styled.iframe`
  border: 0;
  max-height: 100%;
  width: 100%;
  display: block;
`)
