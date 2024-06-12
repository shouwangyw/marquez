// Copyright 2018-2024 contributors to the Marquez project
// SPDX-License-Identifier: Apache-2.0

import * as Redux from 'redux'
import { Chip, Divider } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IEsSearchJobsState } from '../../../store/reducers/esSearch'
import { IState } from '../../../store/reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog'
import { fetchEsSearchJobs } from '../../../store/actionCreators'
import { theme } from '../../../helpers/theme'
import Box from '@mui/system/Box'
import MqText from '../../core/text/MqText'
import React, { useEffect } from 'react'

interface StateProps {
  esSearchJobs: IEsSearchJobsState
}

interface DispatchProps {
  fetchEsSearchJobs: typeof fetchEsSearchJobs
}

interface Props {
  search: string
}

type TextSegment = {
  text: string
  isBold: boolean
}

function parseStringToSegments(input: string): TextSegment[] {
  return input.split(/(<em>.*?<\/em>)/).map((segment) => {
    if (segment.startsWith('<em>') && segment.endsWith('</em>')) {
      return {
        text: segment.slice(4, -5),
        isBold: true,
      }
    } else {
      return {
        text: segment,
        isBold: false,
      }
    }
  })
}

function getValueAfterLastPeriod(s: string) {
  return s.split('.').pop()
}

const EsSearch: React.FC<StateProps & DispatchProps & Props> = ({
  search,
  fetchEsSearchJobs,
  esSearchJobs,
}) => {
  useEffect(() => {
    fetchEsSearchJobs(search)
  }, [search, fetchEsSearchJobs])

  return (
    <Box>
      {esSearchJobs.data.hits.map((hit, index) => {
        return (
          <Box
            key={hit.run_id}
            px={2}
            py={1}
            borderBottom={1}
            borderColor={'divider'}
            sx={{
              transition: 'background-color 0.3s',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <Box display={'flex'}>
              <Box display={'flex'} alignItems={'center'}>
                <FontAwesomeIcon icon={faCog} color={theme.palette.primary.main} />
              </Box>
              <Box ml={2}>
                {hit.name}
                <Box>
                  {Object.entries(esSearchJobs.data.highlights[index]).map(([key, value]) => {
                    return value.map((highlightedString: any, idx: number) => {
                      return (
                        <Box
                          key={`${key}-${value}-${idx}`}
                          display={'flex'}
                          alignItems={'center'}
                          mb={0.5}
                        >
                          <Chip
                            label={getValueAfterLastPeriod(key)}
                            variant={'outlined'}
                            size={'small'}
                            sx={{ mr: 1 }}
                          />
                          {parseStringToSegments(highlightedString || '').map((segment, index) => (
                            <MqText
                              subdued
                              small
                              key={`${key}-${highlightedString}-${segment.text}-${index}`}
                              inline
                              highlight={segment.isBold}
                            >
                              {segment.text}
                            </MqText>
                          ))}
                        </Box>
                      )
                    })
                  })}
                </Box>
              </Box>
              {hit.facets.sourceCode?.language && (
                <>
                  <Divider flexItem sx={{ mx: 1 }} orientation={'vertical'} />
                  <Box>
                    <MqText subdued sx={{ mb: 1 }}>
                      {'Language'}
                    </MqText>
                    <Chip
                      size={'small'}
                      variant={'outlined'}
                      label={hit.facets.sourceCode.language}
                    />
                  </Box>
                </>
              )}
              <Divider flexItem sx={{ mx: 1 }} orientation={'vertical'} />
              <Box display={'flex'} flexDirection={'column'} justifyContent={'flex-start'}>
                <MqText subdued sx={{ mb: 1 }}>
                  {'Namespace'}
                </MqText>
                <MqText font={'mono'}>{hit.namespace}</MqText>
              </Box>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

const mapStateToProps = (state: IState) => {
  return {
    esSearchJobs: state.esSearchJobs,
  }
}

const mapDispatchToProps = (dispatch: Redux.Dispatch) =>
  bindActionCreators(
    {
      fetchEsSearchJobs: fetchEsSearchJobs,
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(EsSearch)
