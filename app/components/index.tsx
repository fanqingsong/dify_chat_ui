/* eslint-disable @typescript-eslint/no-use-before-define */
'use client'
import type { FC } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import produce, { setAutoFreeze } from 'immer'
import { useBoolean, useGetState } from 'ahooks'
import useConversation from '@/hooks/use-conversation'
import Toast from '@/app/components/base/toast'
import Sidebar from '@/app/components/sidebar'
import ConfigSence from '@/app/components/config-scence'
import Header from '@/app/components/header'
import { fetchAppParams, fetchChatList, fetchConversations, generationConversationName, sendChatMessage, updateFeedback } from '@/service'
import type { ChatItem, ConversationItem, Feedbacktype, PromptConfig, VisionFile, VisionSettings } from '@/types/app'
import { Resolution, TransferMethod, WorkflowRunningStatus } from '@/types/app'
import Chat from '@/app/components/chat'
import { setLocaleOnClient } from '@/i18n/client'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import Loading from '@/app/components/base/loading'
import { replaceVarWithValues, userInputsFormToPromptVariables } from '@/utils/prompt'
import AppUnavailable from '@/app/components/app-unavailable'
import { APP_INFO, isShowPrompt, promptTemplate, getCurrentAppConfig } from '@/config'
import type { Annotation as AnnotationType } from '@/types/log'
import { addFileInfos, sortAgentSorts } from '@/utils/tools'
import useAuth from '@/hooks/use-auth'

export type IMainProps = {
  params: any
}

const Main: FC<IMainProps> = () => {
  const { t } = useTranslation()
  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile
  const currentAppConfig = getCurrentAppConfig()
  const hasSetAppConfig = currentAppConfig.appId && currentAppConfig.apiKey
  const { user } = useAuth()

  // 即使APP不可用，至少也显示基本界面
  if (!hasSetAppConfig) {
    return (
      <div className='flex flex-col h-full'>
        <Header title={APP_INFO.title || 'Dify Chat'} isMobile={isMobile} />
        <div className='flex flex-1'>
          <AppUnavailable />
        </div>
      </div>
    )
  }

  /*
  * app info
  */
  const [appUnavailable, setAppUnavailable] = useState<boolean>(false)
  const [isUnknownReason, setIsUnknownReason] = useState<boolean>(false)
  const [promptConfig, setPromptConfig] = useState<PromptConfig>({
    prompt_template: promptTemplate,
    prompt_variables: [],
  } as PromptConfig)
  const [inited, setInited] = useState<boolean>(false)
  // in mobile, show sidebar by click button
  const [isShowSidebar, { setTrue: showSidebar, setFalse: hideSidebar }] = useBoolean(false)
  const [visionConfig, setVisionConfig] = useState<VisionSettings | undefined>({
    enabled: false,
    number_limits: 2,
    detail: Resolution.low,
    transfer_methods: [TransferMethod.local_file],
  })

  useEffect(() => {
    if (APP_INFO?.title)
      document.title = `${APP_INFO.title} - Powered by Dify`
  }, [APP_INFO?.title])

  // onData change thought (the produce obj). https://github.com/immerjs/immer/issues/576
  useEffect(() => {
    setAutoFreeze(false)
    return () => {
      setAutoFreeze(true)
    }
  }, [])

  /*
  * conversation info
  */
  const {
    conversationList,
    setConversationList,
    currConversationId,
    getCurrConversationId,
    setCurrConversationId,
    getConversationIdFromStorage,
    isNewConversation,
    currConversationInfo,
    currInputs,
    newConversationInputs,
    resetNewConversationInputs,
    setCurrInputs,
    setNewConversationInfo,
    setExistConversationInfo,
  } = useConversation()

  const [conversationIdChangeBecauseOfNew, setConversationIdChangeBecauseOfNew, getConversationIdChangeBecauseOfNew] = useGetState(false)
  const [isChatStarted, { setTrue: setChatStarted, setFalse: setChatNotStarted }] = useBoolean(false)

  // 添加一个标志，控制初始加载时是否直接显示对话界面
  const [skipWelcomeScreen] = useState(true)

  const handleStartChat = (inputs: Record<string, any>) => {
    createNewChat()
    setConversationIdChangeBecauseOfNew(true)
    setCurrInputs(inputs)
    setChatStarted()
    // parse variables in introduction
    setChatList(generateNewChatListWithOpenStatement('', inputs))
  }

  const hasSetInputs = (() => {
    if (!isNewConversation)
      return true

    // 如果设置了跳过欢迎界面，并且已经初始化完成，则直接返回true
    if (skipWelcomeScreen && inited)
      return true

    return isChatStarted
  })()

  // 自动开始对话，跳过欢迎界面
  useEffect(() => {
    if (inited && isNewConversation && !isChatStarted && promptConfig) {
      const defaultInputs: Record<string, any> = {}
      if (promptConfig.prompt_variables) {
        promptConfig.prompt_variables.forEach((item) => {
          defaultInputs[item.key] = item.default || ''
        })
      }
      // 添加一个setTimeout，使其在视觉上看不到闪烁
      setTimeout(() => {
        handleStartChat(defaultInputs)
      }, 0)
    }
  }, [inited, isNewConversation, isChatStarted, promptConfig])

  const conversationName = currConversationInfo?.name || t('app.chat.newChatDefaultName') as string
  const conversationIntroduction = currConversationInfo?.introduction || ''

  const handleConversationSwitch = () => {
    if (!inited)
      return

    // update inputs of current conversation
    let notSyncToStateIntroduction = ''
    let notSyncToStateInputs: Record<string, any> | undefined | null = {}
    if (!isNewConversation) {
      const item = conversationList.find(item => item.id === currConversationId)
      notSyncToStateInputs = item?.inputs || {}
      setCurrInputs(notSyncToStateInputs as any)
      notSyncToStateIntroduction = item?.introduction || ''
      setExistConversationInfo({
        name: item?.name || '',
        introduction: notSyncToStateIntroduction,
      })
    }
    else {
      notSyncToStateInputs = newConversationInputs
      setCurrInputs(notSyncToStateInputs)
    }

    // update chat list of current conversation
    if (!isNewConversation && !conversationIdChangeBecauseOfNew && !isResponding) {
      fetchChatList(currConversationId).then((res: any) => {
        const { data } = res
        const newChatList: ChatItem[] = generateNewChatListWithOpenStatement(notSyncToStateIntroduction, notSyncToStateInputs)

        data.forEach((item: any) => {
          newChatList.push({
            id: `question-${item.id}`,
            content: item.query,
            isAnswer: false,
            message_files: item.message_files?.filter((file: any) => file.belongs_to === 'user') || [],

          })
          newChatList.push({
            id: item.id,
            content: item.answer,
            agent_thoughts: addFileInfos(item.agent_thoughts ? sortAgentSorts(item.agent_thoughts) : item.agent_thoughts, item.message_files),
            feedback: item.feedback,
            isAnswer: true,
            message_files: item.message_files?.filter((file: any) => file.belongs_to === 'assistant') || [],
          })
        })
        setChatList(newChatList)
      }).catch(err => {
        console.error('获取对话列表失败:', err)
      })
    }

    if (isNewConversation && isChatStarted)
      setChatList(generateNewChatListWithOpenStatement())
  }
  useEffect(handleConversationSwitch, [currConversationId, inited])

  const handleConversationIdChange = (id: string) => {
    if (id === '-1') {
      createNewChat()
      setConversationIdChangeBecauseOfNew(true)
    }
    else {
      setConversationIdChangeBecauseOfNew(false)
    }
    // trigger handleConversationSwitch
    setCurrConversationId(id, currentAppConfig.appId)
    hideSidebar()
  }

  /*
  * chat info. chat is under conversation.
  */
  const [chatList, setChatList, getChatList] = useGetState<ChatItem[]>([])
  const chatListDomRef = useRef<HTMLDivElement>(null)
  const [isResponding, { setTrue: setRespondingTrue, setFalse: setRespondingFalse }] = useBoolean(false)

  // 添加对isResponding状态变化的监听
  useEffect(() => {
    console.log('isResponding状态变化:', isResponding)
  }, [isResponding])

  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const { notify } = Toast

  useEffect(() => {
    // scroll to bottom
    if (chatListDomRef.current)
      chatListDomRef.current.scrollTop = chatListDomRef.current.scrollHeight
  }, [chatList, currConversationId])

  // user can not edit inputs if user had send message
  const canEditInputs = !chatList.some(item => item.isAnswer === false) && isNewConversation

  const createNewChat = () => {
    // if new chat is already exist, do not create new chat
    if (conversationList.some(item => item.id === '-1'))
      return

    setConversationList(produce(conversationList, (draft) => {
      draft.unshift({
        id: '-1',
        name: t('app.chat.newChatDefaultName'),
        inputs: newConversationInputs,
        introduction: conversationIntroduction,
      })
    }))
  }

  // log error to toast
  const logError = (message: string) => {
    notify({ type: 'error', message })
  }

  // check if can send message
  const checkCanSend = () => {
    if (currConversationId !== '-1')
      return true

    if (!currInputs || !promptConfig?.prompt_variables)
      return true

    const inputLens = Object.values(currInputs).length
    const promptVariablesLens = promptConfig.prompt_variables.length

    const emptyInput = inputLens < promptVariablesLens || Object.values(currInputs).find(v => !v)
    if (emptyInput) {
      logError(t('app.errorMessage.valueOfVarRequired'))
      return false
    }
    return true
  }

  // sometime introduction is not applied to state
  const generateNewChatListWithOpenStatement = (introduction?: string, inputs?: Record<string, any> | null) => {
    let calculatedIntroduction = introduction || conversationIntroduction || ''
    const calculatedPromptVariables = inputs || currInputs || null
    if (calculatedIntroduction && calculatedPromptVariables)
      calculatedIntroduction = replaceVarWithValues(calculatedIntroduction, promptConfig?.prompt_variables || [], calculatedPromptVariables)

    const openStatement = {
      id: `${Date.now()}`,
      content: calculatedIntroduction,
      isAnswer: true,
      feedbackDisabled: true,
      isOpeningStatement: isShowPrompt,
    }
    if (calculatedIntroduction)
      return [openStatement]

    return []
  }

  // track states for workflow
  const [controlFocus, setControlFocus] = useState(0)
  const [openingSuggestedQuestions, setOpeningSuggestedQuestions] = useState<string[]>([])
  const [messageTaskId, setMessageTaskId] = useState('')
  const [hasStopResponded, setHasStopResponded, getHasStopResponded] = useGetState(false)
  const [isRespondingConIsCurrCon, setIsRespondingConCurrCon, getIsRespondingConIsCurrCon] = useGetState(true)
  const [userQuery, setUserQuery] = useState('')

  // init app
  useEffect(() => {
    if (!hasSetAppConfig) {
      setAppUnavailable(true)
      return
    }
    (async () => {
      try {
        // 添加超时处理，防止无限加载
        const timeout = setTimeout(() => {
          setInited(true)
          Toast.notify({ type: 'warning', message: '数据加载超时，使用默认配置' })
        }, 5000);

        // 添加错误处理
        try {
          const [conversationData, appParams] = await Promise.all([fetchConversations(), fetchAppParams()])
          // 清除超时
          clearTimeout(timeout)

          // handle current conversation id
          const { data: conversations, error } = conversationData as { data: ConversationItem[]; error: string }
          if (error) {
            Toast.notify({ type: 'error', message: error })
            throw new Error(error)
          }

          const _conversationId = getConversationIdFromStorage(currentAppConfig.appId)
          const isNotNewConversation = conversations.some(item => item.id === _conversationId)

          // fetch new conversation info
          const { user_input_form, opening_statement: introduction, file_upload, system_parameters }: any = appParams
          setLocaleOnClient(APP_INFO.default_language, true)
          setNewConversationInfo({
            name: t('app.chat.newChatDefaultName'),
            introduction,
          })
          const prompt_variables = userInputsFormToPromptVariables(user_input_form)
          setPromptConfig({
            prompt_template: promptTemplate,
            prompt_variables: prompt_variables || [],
          } as PromptConfig)
          setVisionConfig({
            ...file_upload?.image,
            image_file_size_limit: system_parameters?.system_parameters || 0,
          })
          setConversationList(conversations as ConversationItem[])

          if (isNotNewConversation)
            setCurrConversationId(_conversationId, currentAppConfig.appId, false)

          setInited(true)
        } catch (e) {
          clearTimeout(timeout)
          throw e;
        }
      }
      catch (e: any) {
        console.error('初始化应用失败:', e)
        // 设置默认配置以便应用能够启动
        setPromptConfig({
          prompt_template: promptTemplate,
          prompt_variables: [],
        } as PromptConfig)
        setConversationList([])
        setInited(true)

        if (e.status === 404) {
          setAppUnavailable(true)
        }
        else {
          setIsUnknownReason(true)
          setAppUnavailable(true)
        }
      }
    })()
  }, [])

  // update current qa
  const updateCurrentQA = ({
    responseItem,
    questionId,
    placeholderAnswerId,
    questionItem,
  }: {
    responseItem: ChatItem
    questionId: string
    placeholderAnswerId: string
    questionItem: ChatItem
  }) => {
    // closesure new list is outdated.
    const newListWithAnswer = produce(
      getChatList().filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
      (draft) => {
        if (!draft.find(item => item.id === questionId))
          draft.push({ ...questionItem })

        draft.push({ ...responseItem })
      })
    setChatList(newListWithAnswer)
  }

  // transform file to server format
  const transformToServerFile = (fileItem: any) => {
    return {
      type: 'image',
      transfer_method: fileItem.transferMethod,
      url: fileItem.url,
      upload_file_id: fileItem.id,
    }
  }

  // send chat message
  const handleSend = async (message: string, files?: VisionFile[]) => {
    if (isResponding) {
      notify({ type: 'info', message: t('app.errorMessage.waitForResponse') || '请等待上一条消息回复完成' })
      return
    }

    if (!message && (!files || files.length === 0))
      return

    // prepare inputs
    const toServerInputs: Record<string, any> = {}
    if (currInputs) {
      Object.keys(currInputs).forEach((key) => {
        const value = currInputs[key]
        if (value?.supportFileType)
          toServerInputs[key] = transformToServerFile(value)
        else if (value?.[0]?.supportFileType)
          toServerInputs[key] = value.map((item: any) => transformToServerFile(item))
        else
          toServerInputs[key] = value
      })
    }

    // prepare data for API call
    const data: Record<string, any> = {
      inputs: toServerInputs,
      query: message,
      conversation_id: isNewConversation ? null : currConversationId,
    }

    if (visionConfig?.enabled && files && files?.length > 0) {
      data.files = files.map((item) => {
        if (item.transfer_method === TransferMethod.local_file) {
          return {
            ...item,
            url: '',
          }
        }
        return item
      })
    }

    // prepare UI
    const questionId = `question-${Date.now()}`
    const questionItem = {
      id: questionId,
      content: message,
      isAnswer: false,
      message_files: files,
    }

    const placeholderAnswerId = `answer-placeholder-${Date.now()}`
    const placeholderAnswerItem = {
      id: placeholderAnswerId,
      content: '',
      isAnswer: true,
    }

    const newList = [...getChatList(), questionItem, placeholderAnswerItem]
    setChatList(newList)

    let isAgentMode = false
    const responseItem: ChatItem = {
      id: `${Date.now()}`,
      content: '',
      agent_thoughts: [],
      message_files: [],
      isAnswer: true,
    }
    let hasSetResponseId = false

    const prevTempNewConversationId = getCurrConversationId() || '-1'
    let tempNewConversationId = ''

    setRespondingTrue()

    try {
      await sendChatMessage(data, {
        getAbortController: (abortController) => {
          setAbortController(abortController)
        },
        onData: (message: string, isFirstMessage: boolean, { conversationId: newConversationId, messageId, taskId }: any) => {
          if (!isAgentMode) {
            responseItem.content = responseItem.content + message
          }
          else {
            const lastThought = responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1]
            if (lastThought)
              lastThought.thought = lastThought.thought + message // need immer setAutoFreeze
          }
          if (messageId && !hasSetResponseId) {
            responseItem.id = messageId
            hasSetResponseId = true
          }

          if (isFirstMessage && newConversationId)
            tempNewConversationId = newConversationId

          setMessageTaskId(taskId)
          // has switched to other conversation
          if (prevTempNewConversationId !== getCurrConversationId()) {
            setIsRespondingConCurrCon(false)
            return
          }
          updateCurrentQA({
            responseItem,
            questionId,
            placeholderAnswerId,
            questionItem,
          })
        },
        async onCompleted(hasError?: boolean) {
          if (hasError)
            return

          if (getConversationIdChangeBecauseOfNew()) {
            const { data: allConversations }: any = await fetchConversations()
            const newItem: any = await generationConversationName(allConversations[0].id)

            const newAllConversations = produce(allConversations, (draft: any) => {
              draft[0].name = newItem.name
            })
            setConversationList(newAllConversations as any)
          }
          setConversationIdChangeBecauseOfNew(false)
          resetNewConversationInputs()
          setChatNotStarted()
          setCurrConversationId(tempNewConversationId, currentAppConfig.appId, true)
          setRespondingFalse()
        },
        onFile(file) {
          const lastThought = responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1]
          if (lastThought)
            lastThought.message_files = [...(lastThought as any).message_files, { ...file }]

          updateCurrentQA({
            responseItem,
            questionId,
            placeholderAnswerId,
            questionItem,
          })
        },
        onThought(thought) {
          isAgentMode = true
          const response = responseItem as any
          if (thought.message_id && !hasSetResponseId) {
            response.id = thought.message_id
            hasSetResponseId = true
          }
          if (response.agent_thoughts.length === 0) {
            response.agent_thoughts.push(thought)
          }
          else {
            const lastThought = response.agent_thoughts[response.agent_thoughts.length - 1]
            // thought changed but still the same thought, so update.
            if (lastThought.id === thought.id) {
              thought.thought = lastThought.thought
              thought.message_files = lastThought.message_files
              responseItem.agent_thoughts![response.agent_thoughts.length - 1] = thought
            }
            else {
              responseItem.agent_thoughts!.push(thought)
            }
          }
          // has switched to other conversation
          if (prevTempNewConversationId !== getCurrConversationId()) {
            setIsRespondingConCurrCon(false)
            return false
          }

          updateCurrentQA({
            responseItem,
            questionId,
            placeholderAnswerId,
            questionItem,
          })
        },
        onMessageEnd: (messageEnd) => {
          if (messageEnd.metadata?.annotation_reply) {
            responseItem.id = messageEnd.id
            responseItem.annotation = ({
              id: messageEnd.metadata.annotation_reply.id,
              authorName: messageEnd.metadata.annotation_reply.account.name,
            } as AnnotationType)
            const newListWithAnswer = produce(
              getChatList().filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
              (draft) => {
                if (!draft.find(item => item.id === questionId))
                  draft.push({ ...questionItem })

                draft.push({
                  ...responseItem,
                })
              })
            setChatList(newListWithAnswer)
            // 确保消息结束时重置状态
            setRespondingFalse()
            return
          }
          // not support show citation
          // responseItem.citation = messageEnd.retriever_resources
          const newListWithAnswer = produce(
            getChatList().filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
            (draft) => {
              if (!draft.find(item => item.id === questionId))
                draft.push({ ...questionItem })

              draft.push({ ...responseItem })
            })
          setChatList(newListWithAnswer)
          // 确保消息结束时重置状态
          setRespondingFalse()
        },
        onMessageReplace: (messageReplace) => {
          setChatList(produce(
            getChatList(),
            (draft) => {
              const current = draft.find(item => item.id === messageReplace.id)

              if (current)
                current.content = messageReplace.answer
            },
          ))
        },
        onError() {
          setRespondingFalse()
          // role back placeholder answer
          setChatList(produce(getChatList(), (draft) => {
            draft.splice(draft.findIndex(item => item.id === placeholderAnswerId), 1)
          }))
        },
        onWorkflowStarted: ({ workflow_run_id, task_id }) => {
          responseItem.workflow_run_id = workflow_run_id
          responseItem.workflowProcess = {
            status: WorkflowRunningStatus.Running,
            tracing: [],
          }
          setChatList(produce(getChatList(), (draft) => {
            const currentIndex = draft.findIndex(item => item.id === responseItem.id)
            if (currentIndex !== -1) {
              draft[currentIndex] = {
                ...draft[currentIndex],
                ...responseItem,
              }
            }
          }))
        },
        onWorkflowFinished: ({ data }) => {
          if (responseItem.workflowProcess) {
            responseItem.workflowProcess.status = data.status as WorkflowRunningStatus
            setChatList(produce(getChatList(), (draft) => {
              const currentIndex = draft.findIndex(item => item.id === responseItem.id)
              if (currentIndex !== -1) {
                draft[currentIndex] = {
                  ...draft[currentIndex],
                  ...responseItem,
                }
              }
            }))
            // 工作流结束时重置状态
            setRespondingFalse()
          }
        },
        onNodeStarted: ({ data }) => {
          if (responseItem.workflowProcess?.tracing) {
            responseItem.workflowProcess.tracing.push(data as any)
            setChatList(produce(getChatList(), (draft) => {
              const currentIndex = draft.findIndex(item => item.id === responseItem.id)
              if (currentIndex !== -1) {
                draft[currentIndex] = {
                  ...draft[currentIndex],
                  ...responseItem,
                }
              }
            }))
          }
        },
        onNodeFinished: ({ data }) => {
          if (responseItem.workflowProcess?.tracing) {
            const currentTraceIndex = responseItem.workflowProcess.tracing.findIndex(item => item.node_id === data.node_id)
            if (currentTraceIndex !== -1) {
              responseItem.workflowProcess.tracing[currentTraceIndex] = data as any
              setChatList(produce(getChatList(), (draft) => {
                const currentIndex = draft.findIndex(item => item.id === responseItem.id)
                if (currentIndex !== -1) {
                  draft[currentIndex] = {
                    ...draft[currentIndex],
                    ...responseItem,
                  }
                }
              }))
            }
          }
        },
      })
    } catch (error) {
      console.error('发送消息失败:', error)
      setRespondingFalse()
      // 移除占位回复
      setChatList(produce(getChatList(), (draft) => {
        const placeholderIndex = draft.findIndex(item => item.id === placeholderAnswerId)
        if (placeholderIndex !== -1)
          draft.splice(placeholderIndex, 1)
      }))
    }
  }

  const handleFeedback = async (messageId: string, feedback: Feedbacktype) => {
    try {
      await updateFeedback({ url: `/messages/${messageId}/feedbacks`, body: { rating: feedback.rating } })
      const newChatList = chatList.map((item) => {
        if (item.id === messageId) {
          return {
            ...item,
            feedback,
          }
        }
        return item
      })
      setChatList(newChatList)
      notify({ type: 'success', message: t('common.api.success') })
    } catch (error) {
      console.error('提交反馈失败:', error)
      notify({ type: 'error', message: '提交反馈失败' })
    }
  }

  const renderSidebar = () => {
    if (!currentAppConfig.appId || !APP_INFO || !promptConfig)
      return null
    return (
      <Sidebar
        list={conversationList}
        onCurrentIdChange={handleConversationIdChange}
        currentId={currConversationId}
        copyRight={APP_INFO.copyright || APP_INFO.title}
      />
    )
  }

  // 修改过的检查方式，只检查必要的配置
  if (!APP_INFO || !promptConfig)
    return <Loading type='app' />

  return (
    <div className='bg-gray-100'>
      <Header
        title={APP_INFO.title}
        isMobile={isMobile}
        onShowSideBar={showSidebar}
      />
      <div className="flex rounded-t-2xl bg-white overflow-hidden">
        {/* sidebar */}
        {!isMobile && renderSidebar()}
        {isMobile && isShowSidebar && (
          <div className='fixed inset-0 z-50'
            style={{ backgroundColor: 'rgba(35, 56, 118, 0.2)' }}
            onClick={hideSidebar}
          >
            <div className='inline-block' onClick={e => e.stopPropagation()}>
              {renderSidebar()}
            </div>
          </div>
        )}
        {/* main */}
        <div className='flex-grow flex flex-col h-[calc(100vh_-_3rem)] overflow-y-auto'>
          {/* 完全隐藏ConfigSence组件 */}
          {false && !skipWelcomeScreen && !inited && (
            <ConfigSence
              conversationName={conversationName}
              hasSetInputs={hasSetInputs}
              isPublicVersion={isShowPrompt}
              siteInfo={APP_INFO}
              promptConfig={promptConfig}
              onStartChat={handleStartChat}
              canEditInputs={canEditInputs}
              savedInputs={currInputs as Record<string, any>}
              onInputsChange={setCurrInputs}
            ></ConfigSence>
          )}

          {/* 始终显示聊天界面 */}
          <div className='relative grow h-[200px] pc:w-[794px] max-w-full mobile:w-full pb-[66px] mx-auto mb-3.5 overflow-hidden'>
            <div className='h-full overflow-y-auto' ref={chatListDomRef}>
              <Chat
                chatList={chatList}
                onSend={handleSend}
                onFeedback={handleFeedback}
                isResponding={isResponding}
                checkCanSend={checkCanSend}
                visionConfig={visionConfig}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(Main)
