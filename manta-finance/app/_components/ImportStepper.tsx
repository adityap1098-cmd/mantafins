interface Step {
  label: string
  description?: string
}

interface ImportStepperProps {
  steps: Step[]
  currentStep: number
}

export default function ImportStepper({ steps, currentStep }: ImportStepperProps) {
  return (
    <div className="stepper">
      {steps.map((step, index) => {
        const stepNum = index + 1
        const isDone = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isLast = index === steps.length - 1

        const circleState = isDone ? 'done' : isActive ? 'active' : 'idle'
        const labelState = isActive ? 'active' : ''

        return (
          <div key={stepNum} className="step">
            <div className={`step-circle ${circleState}`}>
              {isDone ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : stepNum}
            </div>
            <span className={`step-label ${labelState}`}>
              {step.label}
            </span>
            {!isLast && <div className={`step-line ${isDone ? 'done' : ''}`} />}
          </div>
        )
      })}
    </div>
  )
}
