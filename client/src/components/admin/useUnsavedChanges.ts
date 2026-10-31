import { App } from 'antd'
import { useEffect } from 'react'
import { useBlocker } from 'react-router'

/** Warns before leaving a page (in-app navigation or tab close) while `dirty`. */
export function useUnsavedChanges(dirty: boolean) {
  const { modal } = App.useApp()
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    modal.confirm({
      title: 'Yadda saxlanmamış dəyişikliklər var',
      content: 'Səhifədən çıxsanız dəyişikliklər itəcək.',
      okText: 'Çıx',
      cancelText: 'Qal',
      okButtonProps: { danger: true },
      onOk: () => blocker.proceed(),
      onCancel: () => blocker.reset(),
    })
  }, [blocker, modal])

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])
}
