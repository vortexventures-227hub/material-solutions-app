import Head from 'next/head'
import { motion } from 'framer-motion'
import {
  fetchFsmInventoryItem,
  fetchFsmPublishPayload,
} from '../../lib/fsmBackend'

function money(value) {
  if (!value) return 'Call for pricing'
  if (typeof value === 'string' && value.toLowerCase().includes('call')) return value
  const numeric = Number(String(value).replace(/[^0-9.]/g, ''))
  return numeric ? `$${numeric.toLocaleString()}` : value
}

function firstImage(item) {
  return item?.imageUrl || (item?.image ? `/images/${item.image}` : '/images/raymond_2166.jpg')
}

function specRows(item) {
  return [
    ['Power', item.fuel],
    ['Hours', item.hours && item.hours !== 'Call' ? `${item.hours} hrs` : item.hours],
    ['Capacity', item.capacity],
    ['Status', item.status],
    ['Category', item.category],
  ].filter(([, value]) => value)
}

export default function InventoryDetail({ item, payload, degradedReason = '' }) {
  const title = payload?.seo?.title || `${item.name} | Material Solutions NJ`
  const description = payload?.seo?.metaDescription || item.description
  const image = payload?.media?.primaryUrl || firstImage(item)
  const jsonLd = payload?.schema?.jsonLd || payload?.schema?.product || null
  const requiredFields = payload?.requiredFields || {}

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={payload?.seo?.openGraph?.ogTitle || title} />
        <meta property="og:description" content={payload?.seo?.openGraph?.ogDescription || description} />
        <meta property="og:image" content={image} />
        <meta property="og:type" content="product" />
        {payload?.seo?.canonical && <link rel="canonical" href={payload.seo.canonical} />}
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
      </Head>

      <div className="pt-24 pb-16 px-4 bg-white">
        <main className="max-w-6xl mx-auto">
          {degradedReason && (
            <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
              Forklift Sales Machine live payload is temporarily unavailable. Showing available listing details.
            </div>
          )}

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm"
            >
              <img
                src={image}
                alt={item.name}
                className="w-full h-[360px] md:h-[520px] object-cover"
              />
            </motion.div>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="inline-flex rounded-full bg-yellow-100 border border-yellow-200 px-3 py-1 text-xs font-bold text-yellow-700 mb-4">
                {item.status || 'Available'}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-black mb-4">{item.name}</h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{description}</p>

              <div className="text-4xl font-black text-yellow-600 mb-8">{money(item.price)}</div>

              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {specRows(item).map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="text-xs uppercase tracking-widest text-gray-400 font-bold">{label}</div>
                    <div className="text-black font-bold mt-1">{value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <a
                  href={`/contact?inventory=${encodeURIComponent(item.name)}`}
                  className="flex-1 rounded-lg py-4 px-6 text-center font-black text-black"
                  style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}
                >
                  Get Quote
                </a>
                <a
                  href="/inventory"
                  className="rounded-lg border border-gray-200 py-4 px-6 text-center font-bold text-black bg-white"
                >
                  Back to Inventory
                </a>
              </div>

              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="font-black text-black">Publish Button readiness</h2>
                  <span className="text-xs font-black text-yellow-700">
                    {payload?.complete ? 'READY' : 'REVIEW'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(requiredFields).map(([field, ready]) => (
                    <span
                      key={field}
                      className="rounded px-2 py-1 text-xs font-bold"
                      style={{
                        background: ready ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 215, 0, 0.2)',
                        color: ready ? '#15803D' : '#B8860B',
                      }}
                    >
                      {field.replace(/([A-Z])/g, ' $1')}
                    </span>
                  ))}
                </div>
              </div>
            </motion.section>
          </div>

          {Array.isArray(payload?.aeo?.faq) && payload.aeo.faq.length > 0 && (
            <section className="mt-16">
              <h2 className="text-3xl font-black text-black mb-6">Common Questions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {payload.aeo.faq.slice(0, 4).map((item, index) => (
                  <div key={index} className="rounded-xl border border-gray-200 bg-white p-5">
                    <h3 className="font-black text-black mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.acceptedAnswer?.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const item = await fetchFsmInventoryItem(params.id)
    let payload = null
    let degradedReason = ''

    try {
      payload = await fetchFsmPublishPayload(params.id)
    } catch (error) {
      degradedReason = error.message || 'Publish payload unavailable'
    }

    return {
      props: {
        item,
        payload,
        degradedReason,
      },
    }
  } catch (_error) {
    return { notFound: true }
  }
}
