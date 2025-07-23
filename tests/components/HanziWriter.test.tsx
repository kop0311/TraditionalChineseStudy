import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import HanziWriter from '../../components/HanziWriter'

// Mock the global HanziWriter
const mockHanziWriter = {
  create: jest.fn(),
  animateCharacter: jest.fn(),
  quiz: jest.fn(),
  showOutline: jest.fn(),
  cancelQuiz: jest.fn(),
}

// Mock the global window object
Object.defineProperty(window, 'HanziWriter', {
  value: mockHanziWriter,
  writable: true,
})

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  value: jest.fn(),
  writable: true,
})

describe('HanziWriter Component', () => {
  const mockOnComplete = jest.fn()
  
  const defaultProps = {
    character: '学',
    width: 300,
    height: 300,
    showOutline: true,
    showCharacter: false,
    onComplete: mockOnComplete,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock the HanziWriter instance
    const mockInstance = {
      animateCharacter: jest.fn(),
      quiz: jest.fn((options) => {
        // Simulate successful completion
        setTimeout(() => options.onComplete?.(), 100)
      }),
      showOutline: jest.fn(),
      cancelQuiz: jest.fn(),
    }
    
    mockHanziWriter.create.mockReturnValue(mockInstance)
  })

  afterEach(() => {
    // Clean up any timers
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('renders loading state initially', () => {
    // Mock HanziWriter as not loaded
    Object.defineProperty(window, 'HanziWriter', {
      value: undefined,
      writable: true,
    })

    render(<HanziWriter {...defaultProps} />)
    
    expect(screen.getByText('加载汉字书写组件...')).toBeInTheDocument()
  })

  it('renders HanziWriter component when loaded', async () => {
    render(<HanziWriter {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('演示笔画')).toBeInTheDocument()
    })
    
    expect(screen.getByText('开始练习')).toBeInTheDocument()
    expect(screen.getByText('显示提示')).toBeInTheDocument()
    expect(screen.getByText('重新开始')).toBeInTheDocument()
  })

  it('creates HanziWriter instance with correct parameters', async () => {
    render(<HanziWriter {...defaultProps} />)
    
    await waitFor(() => {
      expect(mockHanziWriter.create).toHaveBeenCalledWith(
        expect.any(Object), // SVG element
        '学',
        expect.objectContaining({
          width: 300,
          height: 300,
          padding: 20,
          showOutline: true,
          showCharacter: false,
        })
      )
    })
  })

  it('starts animation when演示笔画 button is clicked', async () => {
    const mockInstance = {
      animateCharacter: jest.fn(),
      quiz: jest.fn(),
      showOutline: jest.fn(),
      cancelQuiz: jest.fn(),
    }
    
    mockHanziWriter.create.mockReturnValue(mockInstance)
    
    render(<HanziWriter {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('演示笔画')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('演示笔画'))
    
    expect(mockInstance.animateCharacter).toHaveBeenCalled()
  })

  it('starts quiz when开始练习 button is clicked', async () => {
    const mockInstance = {
      animateCharacter: jest.fn(),
      quiz: jest.fn(),
      showOutline: jest.fn(),
      cancelQuiz: jest.fn(),
    }
    
    mockHanziWriter.create.mockReturnValue(mockInstance)
    
    render(<HanziWriter {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('开始练习')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('开始练习'))
    
    expect(mockInstance.quiz).toHaveBeenCalled()
  })

  it('shows hints when显示提示 button is clicked during practice', async () => {
    const mockInstance = {
      animateCharacter: jest.fn(),
      quiz: jest.fn(),
      showOutline: jest.fn(),
      cancelQuiz: jest.fn(),
    }
    
    mockHanziWriter.create.mockReturnValue(mockInstance)
    
    render(<HanziWriter {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('开始练习')).toBeInTheDocument()
    })
    
    // Start practice first
    fireEvent.click(screen.getByText('开始练习'))
    
    // Then click show hints
    fireEvent.click(screen.getByText('显示提示'))
    
    expect(mockInstance.showOutline).toHaveBeenCalled()
  })

  it('resets when重新开始 button is clicked', async () => {
    const mockInstance = {
      animateCharacter: jest.fn(),
      quiz: jest.fn(),
      showOutline: jest.fn(),
      cancelQuiz: jest.fn(),
    }
    
    mockHanziWriter.create.mockReturnValue(mockInstance)
    
    render(<HanziWriter {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('重新开始')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('重新开始'))
    
    expect(mockInstance.cancelQuiz).toHaveBeenCalled()
  })

  it('calls onComplete when practice is finished', async () => {
    jest.useFakeTimers()
    
    const mockInstance = {
      animateCharacter: jest.fn(),
      quiz: jest.fn((options) => {
        setTimeout(() => options.onComplete?.(), 100)
      }),
      showOutline: jest.fn(),
      cancelQuiz: jest.fn(),
    }
    
    mockHanziWriter.create.mockReturnValue(mockInstance)
    
    render(<HanziWriter {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('开始练习')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('开始练习'))
    
    // Fast-forward time
    jest.advanceTimersByTime(100)
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled()
    })
    
    jest.useRealTimers()
  })

  it('handles character change correctly', async () => {
    const { rerender } = render(<HanziWriter {...defaultProps} />)
    
    await waitFor(() => {
      expect(mockHanziWriter.create).toHaveBeenCalledWith(
        expect.any(Object),
        '学',
        expect.any(Object)
      )
    })
    
    // Change character
    rerender(<HanziWriter {...defaultProps} character="书" />)
    
    await waitFor(() => {
      expect(mockHanziWriter.create).toHaveBeenCalledWith(
        expect.any(Object),
        '书',
        expect.any(Object)
      )
    })
  })
})
