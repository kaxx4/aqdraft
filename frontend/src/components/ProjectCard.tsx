import { memo } from 'react'
import { Link } from 'react-router-dom'
import { sized } from '../lib/imageUrl'

interface ProjectCardProps {
  slug: string
  header: string
  objective: string
  location?: string | null | undefined
  volunteers?: number | null
  key_statistic?: string | null
  main_image?: string | null | undefined
  main_image_alt?: string | null | undefined
  index: number
  color: string
  norm: string
  reverseNum?: number
}

function ProjectCard({ slug, header, location, volunteers, key_statistic, main_image, main_image_alt, color, norm, reverseNum, index }: ProjectCardProps) {
  const displayNum = reverseNum ?? (index + 1)

  return (
    <Link to={`/projects/${slug}`} className="pcard" style={{ '--pcard-accent': color } as React.CSSProperties}>
      <div className="pcard-img">
        {main_image ? (
          <img src={sized(main_image, 'card')} alt={main_image_alt || header} className="pcard-img-el" loading="lazy" decoding="async" />
        ) : (
          <div className="pcard-no-img">#{String(displayNum).padStart(3, '0')}</div>
        )}
        <div className="pcard-num">#{String(displayNum).padStart(3, '0')}</div>
      </div>

      <div className="pcard-body">
        <span className="pcard-tag">{norm}</span>
        <h3 className="pcard-title">{header}</h3>
        <div className="pcard-meta">
          {location && (
            <span className="pcard-location">
              <svg width="8" height="10" viewBox="0 0 8 10" fill="none" aria-hidden>
                <path d="M4 0C2.34 0 1 1.34 1 3c0 2.5 3 5.5 3 5.5s3-3 3-5.5C7 1.34 5.66 0 4 0zm0 4.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor"/>
              </svg>
              {location}
            </span>
          )}
          {volunteers != null && <span className="pcard-stats" style={{ fontVariantNumeric: 'tabular-nums' }}>{volunteers} volunteers</span>}
          {key_statistic && <><span className="pcard-dot" /><span className="pcard-stats">{key_statistic}</span></>}
        </div>
      </div>

      <div className="pcard-footer">
        <span className="pcard-cta">View project</span>
        <svg className="pcard-arrow" width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M1 6h9M6.5 1.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </Link>
  )
}

export default memo(ProjectCard)
