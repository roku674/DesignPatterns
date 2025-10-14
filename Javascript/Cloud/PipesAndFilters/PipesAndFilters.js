/**
 * PipesAndFilters Pattern
 *
 * Breaks down complex processing into a series of discrete processing steps (filters)
 * connected by channels (pipes). Each filter processes data and passes it to the next filter.
 *
 * Benefits:
 * - Modularity: Each filter is independent and reusable
 * - Flexibility: Easy to add, remove, or reorder filters
 * - Scalability: Filters can be scaled independently
 * - Testability: Each filter can be tested in isolation
 *
 * Use Cases:
 * - Data transformation pipelines
 * - Image/video processing
 * - ETL (Extract, Transform, Load) operations
 * - Message processing workflows
 */

class Pipe {
  constructor(name) {
    this.name = name;
    this.buffer = [];
    this.statistics = {
      messagesIn: 0,
      messagesOut: 0,
      totalLatency: 0
    };
  }

  async send(data) {
    const message = {
      data: data,
      metadata: {
        enqueuedAt: Date.now(),
        pipeId: this.name,
        messageId: `${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    };

    this.buffer.push(message);
    this.statistics.messagesIn++;
    console.log(`[Pipe:${this.name}] Message queued: ${message.metadata.messageId}`);
    return message;
  }

  async receive() {
    if (this.buffer.length === 0) {
      return null;
    }

    const message = this.buffer.shift();
    this.statistics.messagesOut++;

    const latency = Date.now() - message.metadata.enqueuedAt;
    this.statistics.totalLatency += latency;

    console.log(`[Pipe:${this.name}] Message dequeued: ${message.metadata.messageId} (latency: ${latency}ms)`);
    return message;
  }

  getStatistics() {
    const avgLatency = this.statistics.messagesOut > 0
      ? this.statistics.totalLatency / this.statistics.messagesOut
      : 0;

    return {
      ...this.statistics,
      bufferSize: this.buffer.length,
      averageLatency: Math.round(avgLatency)
    };
  }
}

class Filter {
  constructor(name, processingFunction, config = {}) {
    this.name = name;
    this.processingFunction = processingFunction;
    this.config = {
      validateInput: config.validateInput !== false,
      handleErrors: config.handleErrors !== false,
      logProcessing: config.logProcessing !== false,
      ...config
    };

    this.inputPipe = null;
    this.outputPipe = null;
    this.statistics = {
      processed: 0,
      errors: 0,
      totalProcessingTime: 0
    };
  }

  setInputPipe(pipe) {
    this.inputPipe = pipe;
  }

  setOutputPipe(pipe) {
    this.outputPipe = pipe;
  }

  async process() {
    if (!this.inputPipe) {
      throw new Error(`Filter ${this.name} has no input pipe`);
    }

    const message = await this.inputPipe.receive();
    if (!message) {
      return null;
    }

    const startTime = Date.now();

    if (this.config.logProcessing) {
      console.log(`[Filter:${this.name}] Processing message: ${message.metadata.messageId}`);
    }

    let result;
    if (this.config.handleErrors) {
      result = await this.processingFunction(message.data);
    } else {
      result = await this.processingFunction(message.data);
    }

    const processingTime = Date.now() - startTime;
    this.statistics.totalProcessingTime += processingTime;
    this.statistics.processed++;

    if (result !== null && result !== undefined) {
      if (this.outputPipe) {
        const outputMessage = {
          ...message,
          data: result,
          metadata: {
            ...message.metadata,
            processedBy: this.name,
            processingTime: processingTime
          }
        };
        await this.outputPipe.send(outputMessage.data);
      }
    }

    if (this.config.logProcessing) {
      console.log(`[Filter:${this.name}] Completed in ${processingTime}ms`);
    }

    return result;
  }

  async processAll() {
    const results = [];
    let message;

    while ((message = await this.inputPipe.receive()) !== null) {
      const result = await this.process();
      if (result !== null) {
        results.push(result);
      }
    }

    return results;
  }

  getStatistics() {
    const avgProcessingTime = this.statistics.processed > 0
      ? this.statistics.totalProcessingTime / this.statistics.processed
      : 0;

    return {
      ...this.statistics,
      averageProcessingTime: Math.round(avgProcessingTime)
    };
  }
}

class PipesAndFilters {
  constructor(config = {}) {
    this.config = {
      enableLogging: config.enableLogging !== false,
      enableStatistics: config.enableStatistics !== false,
      ...config
    };

    this.pipes = new Map();
    this.filters = new Map();
    this.pipeline = [];
  }

  createPipe(name) {
    if (this.pipes.has(name)) {
      throw new Error(`Pipe ${name} already exists`);
    }

    const pipe = new Pipe(name);
    this.pipes.set(name, pipe);

    if (this.config.enableLogging) {
      console.log(`[Pipeline] Created pipe: ${name}`);
    }

    return pipe;
  }

  createFilter(name, processingFunction, config = {}) {
    if (this.filters.has(name)) {
      throw new Error(`Filter ${name} already exists`);
    }

    const filter = new Filter(name, processingFunction, {
      ...config,
      logProcessing: this.config.enableLogging
    });
    this.filters.set(name, filter);

    if (this.config.enableLogging) {
      console.log(`[Pipeline] Created filter: ${name}`);
    }

    return filter;
  }

  connect(filterName, inputPipeName, outputPipeName) {
    const filter = this.filters.get(filterName);
    if (!filter) {
      throw new Error(`Filter ${filterName} not found`);
    }

    if (inputPipeName) {
      const inputPipe = this.pipes.get(inputPipeName);
      if (!inputPipe) {
        throw new Error(`Pipe ${inputPipeName} not found`);
      }
      filter.setInputPipe(inputPipe);
    }

    if (outputPipeName) {
      const outputPipe = this.pipes.get(outputPipeName);
      if (!outputPipe) {
        throw new Error(`Pipe ${outputPipeName} not found`);
      }
      filter.setOutputPipe(outputPipe);
    }

    if (this.config.enableLogging) {
      console.log(`[Pipeline] Connected filter ${filterName}: ${inputPipeName} -> ${outputPipeName || 'none'}`);
    }
  }

  addToPipeline(filterName) {
    const filter = this.filters.get(filterName);
    if (!filter) {
      throw new Error(`Filter ${filterName} not found`);
    }

    this.pipeline.push(filter);
  }

  async sendToInput(data, pipeName) {
    const pipe = this.pipes.get(pipeName);
    if (!pipe) {
      throw new Error(`Pipe ${pipeName} not found`);
    }

    return await pipe.send(data);
  }

  async processPipeline() {
    const results = [];

    for (const filter of this.pipeline) {
      let message;
      while ((message = await filter.process()) !== null) {
        results.push(message);
      }
    }

    return results;
  }

  async processWithData(initialData, inputPipeName) {
    await this.sendToInput(initialData, inputPipeName);
    return await this.processPipeline();
  }

  getStatistics() {
    const pipeStats = {};
    for (const [name, pipe] of this.pipes) {
      pipeStats[name] = pipe.getStatistics();
    }

    const filterStats = {};
    for (const [name, filter] of this.filters) {
      filterStats[name] = filter.getStatistics();
    }

    return {
      pipes: pipeStats,
      filters: filterStats,
      pipelineLength: this.pipeline.length
    };
  }

  printStatistics() {
    const stats = this.getStatistics();

    console.log('\n========== Pipes and Filters Statistics ==========');
    console.log(`Pipeline Length: ${stats.pipelineLength} filters\n`);

    console.log('Pipes:');
    for (const [name, pipeStats] of Object.entries(stats.pipes)) {
      console.log(`  ${name}:`);
      console.log(`    Messages In: ${pipeStats.messagesIn}`);
      console.log(`    Messages Out: ${pipeStats.messagesOut}`);
      console.log(`    Buffer Size: ${pipeStats.bufferSize}`);
      console.log(`    Average Latency: ${pipeStats.averageLatency}ms`);
    }

    console.log('\nFilters:');
    for (const [name, filterStats] of Object.entries(stats.filters)) {
      console.log(`  ${name}:`);
      console.log(`    Processed: ${filterStats.processed}`);
      console.log(`    Errors: ${filterStats.errors}`);
      console.log(`    Avg Processing Time: ${filterStats.averageProcessingTime}ms`);
    }

    console.log('==================================================\n');
  }

  execute() {
    console.log('PipesAndFilters Pattern Demonstration');
    console.log('=====================================\n');
    console.log('Configuration:');
    console.log(`  Logging: ${this.config.enableLogging}`);
    console.log(`  Statistics: ${this.config.enableStatistics}`);
    console.log('');

    return {
      success: true,
      pattern: 'PipesAndFilters',
      config: this.config,
      components: {
        pipes: this.pipes.size,
        filters: this.filters.size,
        pipelineLength: this.pipeline.length
      }
    };
  }
}

async function demonstratePipesAndFilters() {
  console.log('Starting Pipes and Filters Pattern Demonstration\n');

  const pipeline = new PipesAndFilters({
    enableLogging: true,
    enableStatistics: true
  });

  console.log('--- Building Image Processing Pipeline ---\n');

  pipeline.createPipe('input');
  pipeline.createPipe('validated');
  pipeline.createPipe('resized');
  pipeline.createPipe('filtered');
  pipeline.createPipe('output');

  pipeline.createFilter('validator', async (data) => {
    console.log('    [Validator] Validating image data...');
    if (!data.image || !data.format) {
      throw new Error('Invalid image data');
    }
    return { ...data, validated: true };
  });

  pipeline.createFilter('resizer', async (data) => {
    console.log(`    [Resizer] Resizing image to ${data.targetWidth || 800}x${data.targetHeight || 600}...`);
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      ...data,
      width: data.targetWidth || 800,
      height: data.targetHeight || 600,
      resized: true
    };
  });

  pipeline.createFilter('effectFilter', async (data) => {
    console.log('    [EffectFilter] Applying image effects...');
    await new Promise(resolve => setTimeout(resolve, 30));
    return {
      ...data,
      effects: ['brightness', 'contrast', 'saturation'],
      filtered: true
    };
  });

  pipeline.createFilter('compressor', async (data) => {
    console.log('    [Compressor] Compressing image...');
    await new Promise(resolve => setTimeout(resolve, 40));
    return {
      ...data,
      compressed: true,
      finalSize: Math.floor(data.image.length * 0.6)
    };
  });

  pipeline.connect('validator', 'input', 'validated');
  pipeline.connect('resizer', 'validated', 'resized');
  pipeline.connect('effectFilter', 'resized', 'filtered');
  pipeline.connect('compressor', 'filtered', 'output');

  pipeline.addToPipeline('validator');
  pipeline.addToPipeline('resizer');
  pipeline.addToPipeline('effectFilter');
  pipeline.addToPipeline('compressor');

  pipeline.execute();

  console.log('\n--- Processing Images ---\n');

  const images = [
    {
      image: 'image1.jpg content...',
      format: 'jpg',
      targetWidth: 1024,
      targetHeight: 768
    },
    {
      image: 'image2.png content...',
      format: 'png',
      targetWidth: 800,
      targetHeight: 600
    },
    {
      image: 'image3.gif content...',
      format: 'gif',
      targetWidth: 640,
      targetHeight: 480
    }
  ];

  for (const image of images) {
    console.log(`\nProcessing ${image.image.substring(0, 10)}...`);
    await pipeline.sendToInput(image, 'input');
  }

  await pipeline.processPipeline();

  const outputPipe = pipeline.pipes.get('output');
  console.log('\n--- Retrieving Processed Images ---\n');
  let processedImage;
  while ((processedImage = await outputPipe.receive()) !== null) {
    console.log('Processed image:', {
      format: processedImage.data.format,
      dimensions: `${processedImage.data.width}x${processedImage.data.height}`,
      effects: processedImage.data.effects,
      finalSize: processedImage.data.finalSize
    });
  }

  pipeline.printStatistics();
}

if (require.main === module) {
  demonstratePipesAndFilters().catch(console.error);
}

module.exports = PipesAndFilters;
