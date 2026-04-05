import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProcessingSteps } from './index';

describe('ProcessingSteps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 3 step labels', () => {
    render(<ProcessingSteps currentStep={0} />);
    expect(screen.getByText('Uploading image')).toBeInTheDocument();
    expect(screen.getByText('Reading receipt')).toBeInTheDocument();
    expect(screen.getByText('Matching products')).toBeInTheDocument();
  });

  it('shows spinner (animate-spin) for the current step', () => {
    const { container } = render(<ProcessingSteps currentStep={1} />);
    // Step 1 "Reading receipt" should have the spinning loader
    const svgs = container.querySelectorAll('svg');
    const spinnerSvg = Array.from(svgs).find((svg) => {
      const classes = svg.className.baseVal || svg.getAttribute('class') || '';
      return classes.includes('animate-spin');
    });
    expect(spinnerSvg).toBeDefined();
  });

  it('shows checkmark for completed steps (before current step)', () => {
    const { container } = render(<ProcessingSteps currentStep={2} />);
    // Steps 0 and 1 are complete, step 2 is current
    // Completed steps use Check icon which has specific Lucide structure
    // There should be 2 checkmark SVGs (for steps 0 and 1)
    const svgs = container.querySelectorAll('svg');
    const greenSvgs = Array.from(svgs).filter((svg) => {
      const classes = svg.className.baseVal || svg.getAttribute('class') || '';
      return classes.includes('text-green-600');
    });
    expect(greenSvgs).toHaveLength(2);
  });

  it('shows pending state (circle icon) for future steps', () => {
    const { container } = render(<ProcessingSteps currentStep={0} />);
    // Steps 1 and 2 are future; they use Circle icon with text-muted-foreground
    const svgs = container.querySelectorAll('svg');
    const mutedSvgs = Array.from(svgs).filter((svg) => {
      const classes = svg.className.baseVal || svg.getAttribute('class') || '';
      return classes.includes('text-muted-foreground') && !classes.includes('animate-spin');
    });
    // Step 1 and step 2 should have muted circle icons
    expect(mutedSvgs).toHaveLength(2);
  });

  it('marks current step text as font-medium', () => {
    render(<ProcessingSteps currentStep={1} />);
    const currentStepText = screen.getByText('Reading receipt');
    expect(currentStepText.className).toContain('font-medium');
  });

  it('marks completed step text as text-muted-foreground', () => {
    render(<ProcessingSteps currentStep={1} />);
    const completedStepText = screen.getByText('Uploading image');
    expect(completedStepText.className).toContain('text-muted-foreground');
  });

  it('marks future step text as text-muted-foreground', () => {
    render(<ProcessingSteps currentStep={0} />);
    const futureStepText = screen.getByText('Reading receipt');
    expect(futureStepText.className).toContain('text-muted-foreground');
  });

  it('has aria-live="polite" for accessibility', () => {
    const { container } = render(<ProcessingSteps currentStep={0} />);
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  it('when all steps are complete (currentStep=3), all show checkmarks', () => {
    const { container } = render(<ProcessingSteps currentStep={3} />);
    const svgs = container.querySelectorAll('svg');
    const greenSvgs = Array.from(svgs).filter((svg) => {
      const classes = svg.className.baseVal || svg.getAttribute('class') || '';
      return classes.includes('text-green-600');
    });
    expect(greenSvgs).toHaveLength(3);
  });

  it('when currentStep=0, first step is current and has spinner', () => {
    const { container } = render(<ProcessingSteps currentStep={0} />);
    const svgs = container.querySelectorAll('svg');
    const spinners = Array.from(svgs).filter((svg) => {
      const classes = svg.className.baseVal || svg.getAttribute('class') || '';
      return classes.includes('animate-spin');
    });
    expect(spinners).toHaveLength(1);
    // No completed steps
    const greenSvgs = Array.from(svgs).filter((svg) => {
      const classes = svg.className.baseVal || svg.getAttribute('class') || '';
      return classes.includes('text-green-600');
    });
    expect(greenSvgs).toHaveLength(0);
  });

  it('includes motion-reduce:animate-none on spinning icon', () => {
    const { container } = render(<ProcessingSteps currentStep={1} />);
    const svgs = container.querySelectorAll('svg');
    const spinnerSvg = Array.from(svgs).find((svg) => {
      const classes = svg.className.baseVal || svg.getAttribute('class') || '';
      return classes.includes('animate-spin');
    });
    const classes = spinnerSvg?.className.baseVal || spinnerSvg?.getAttribute('class') || '';
    expect(classes).toContain('motion-reduce:animate-none');
  });
});
