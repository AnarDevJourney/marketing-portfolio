import { AnimatePresence, m } from 'motion/react'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSendContactMutation } from '../../api/publicApi'
import type { Settings } from '../../api/types'
import { useLocale, useLocalized } from '../../hooks/useLocale'
import { EASE } from '../../lib/motion'
import { Reveal } from '../motion/Reveal'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { SectionHeading } from './SectionHeading'

const EMPTY = { name: '', email: '', subject: '', message: '', website: '' }

export function Contact({
  settings,
  index,
}: {
  settings: Settings
  index: number
}) {
  const { t } = useTranslation()
  const l = useLocalized()
  const { locale } = useLocale()
  const [send, { isLoading }] = useSendContactMutation()
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState<'idle' | 'sent' | 'error' | 'throttled'>(
    'idle',
  )
  // When the form was shown; the API treats instant submissions as bots.
  const startedAt = useRef(0)
  useEffect(() => {
    startedAt.current = Date.now()
  }, [status])

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await send({
        name: form.name,
        email: form.email,
        subject: form.subject || undefined,
        message: form.message,
        website: form.website || undefined,
        locale,
        startedAt: startedAt.current,
      }).unwrap()
      setForm(EMPTY)
      setStatus('sent')
    } catch (err) {
      setStatus(
        (err as { status?: number }).status === 429 ? 'throttled' : 'error',
      )
    }
  }

  const field =
    'peer w-full border-b border-fg/20 bg-transparent pt-7 pb-3 text-lead outline-none transition-colors duration-300 placeholder:text-transparent focus:border-primary'
  const label =
    'pointer-events-none absolute top-7 left-0 text-lead text-fg/50 transition-all duration-300 ease-out-quart peer-focus:top-0 peer-focus:text-label peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-label'

  return (
    <section id="contact" className="py-section">
      <Container>
        <SectionHeading
          index={index}
          label={t('sections.contact')}
          title={t('contact.heading')}
        />

        <div className="grid gap-16 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <p className="max-w-md text-lead text-fg/70">{t('contact.lead')}</p>
            <p className="mt-12 text-label text-fg/50">{t('contact.or')}</p>
            <a
              href={`mailto:${settings.contact.email}`}
              className="group mt-4 inline-block font-heading text-h3 break-all"
              data-cursor="open"
            >
              {settings.contact.email}
              <span className="mt-2 block h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-700 ease-out-expo group-hover:scale-x-100" />
            </a>
            {settings.contact.phone && (
              <p className="mt-6 text-fg/70">{settings.contact.phone}</p>
            )}
            <p className="mt-2 text-fg/50">{l(settings.contact.location)}</p>
          </Reveal>

          <div className="relative md:col-span-6 md:col-start-7">
            <AnimatePresence mode="wait" initial={false}>
              {status === 'sent' ? (
                <m.div
                  key="sent"
                  className="flex min-h-[26rem] flex-col items-start justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: EASE.outQuart }}
                  role="status"
                >
                  <svg
                    viewBox="0 0 64 64"
                    className="size-20 text-primary"
                    aria-hidden
                  >
                    <m.circle
                      cx="32"
                      cy="32"
                      r="30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: EASE.outExpo }}
                    />
                    <m.path
                      d="M20 33l8 8 16-18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.6,
                        ease: EASE.outQuart,
                      }}
                    />
                  </svg>
                  <h3 className="mt-8 text-h2">{t('contact.success')}</h3>
                  <p className="mt-3 text-fg/60">{t('contact.successText')}</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-10 text-label text-fg/60 hover:text-primary"
                  >
                    ← {t('contact.again')}
                  </button>
                </m.div>
              ) : (
                <m.form
                  key="form"
                  onSubmit={submit}
                  className="flex flex-col gap-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {(['name', 'email', 'subject'] as const).map((key) => (
                    <div key={key} className="relative">
                      <input
                        id={`contact-${key}`}
                        type={key === 'email' ? 'email' : 'text'}
                        required={key !== 'subject'}
                        maxLength={key === 'subject' ? 200 : 100}
                        autoComplete={
                          key === 'name'
                            ? 'name'
                            : key === 'email'
                              ? 'email'
                              : 'off'
                        }
                        placeholder=" "
                        value={form[key]}
                        onChange={set(key)}
                        className={field}
                      />
                      <label htmlFor={`contact-${key}`} className={label}>
                        {t(`contact.${key}`)}
                      </label>
                    </div>
                  ))}
                  <div className="relative">
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      maxLength={5000}
                      placeholder=" "
                      value={form.message}
                      onChange={set('message')}
                      className={`${field} resize-none`}
                    />
                    <label htmlFor="contact-message" className={label}>
                      {t('contact.message')}
                    </label>
                  </div>
                  {/* honeypot: hidden from people, bots fill it in */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={set('website')}
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                    aria-hidden
                  />
                  {(status === 'error' || status === 'throttled') && (
                    <p role="alert" className="text-sm text-primary">
                      {t(
                        status === 'throttled'
                          ? 'contact.tooMany'
                          : 'contact.error',
                      )}
                    </p>
                  )}
                  <div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading
                        ? t('contact.sending')
                        : `${t('contact.send')} →`}
                    </Button>
                  </div>
                </m.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  )
}
