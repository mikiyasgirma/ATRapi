import {authenticate} from '@loopback/authentication';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {HotelPerformance} from '../models';
import {HotelPerformanceRepository} from '../repositories';

@authenticate('jwt')
export class HotelPerformanceController {
  constructor(
    @repository(HotelPerformanceRepository)
    public hotelPerformanceRepository: HotelPerformanceRepository,
  ) {}

  @post('/hotel-performances')
  @response(200, {
    description: 'HotelPerformance model instance',
    content: {
      'application/json': {schema: getModelSchemaRef(HotelPerformance)},
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(HotelPerformance, {
            title: 'NewHotelPerformance',
            exclude: ['id'],
          }),
        },
      },
    })
    hotelPerformance: Omit<HotelPerformance, 'id'>,
  ): Promise<HotelPerformance> {
    return this.hotelPerformanceRepository.create(hotelPerformance);
  }

  @get('/hotel-performances/count')
  @response(200, {
    description: 'HotelPerformance model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(HotelPerformance) where?: Where<HotelPerformance>,
  ): Promise<Count> {
    return this.hotelPerformanceRepository.count(where);
  }

  @get('/hotel-performances')
  @response(200, {
    description: 'Array of HotelPerformance model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(HotelPerformance, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(HotelPerformance) filter?: Filter<HotelPerformance>,
  ): Promise<HotelPerformance[]> {
    // Ensure include filter is part of the main filter object
    filter = {
      ...filter,
      include: [{relation: 'hotel'}],
    };
    return this.hotelPerformanceRepository.find(filter);
  }

  @patch('/hotel-performances')
  @response(200, {
    description: 'HotelPerformance PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(HotelPerformance, {partial: true}),
        },
      },
    })
    hotelPerformance: HotelPerformance,
    @param.where(HotelPerformance) where?: Where<HotelPerformance>,
  ): Promise<Count> {
    return this.hotelPerformanceRepository.updateAll(hotelPerformance, where);
  }

  @get('/hotel-performances/{id}')
  @response(200, {
    description: 'HotelPerformance model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(HotelPerformance, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(HotelPerformance, {exclude: 'where'})
    filter?: FilterExcludingWhere<HotelPerformance>,
  ): Promise<HotelPerformance> {
    return this.hotelPerformanceRepository.findById(id, filter);
  }

  @patch('/hotel-performances/{id}')
  @response(204, {
    description: 'HotelPerformance PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(HotelPerformance, {partial: true}),
        },
      },
    })
    hotelPerformance: HotelPerformance,
  ): Promise<void> {
    await this.hotelPerformanceRepository.updateById(id, hotelPerformance);
  }

  @put('/hotel-performances/{id}')
  @response(204, {
    description: 'HotelPerformance PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() hotelPerformance: HotelPerformance,
  ): Promise<void> {
    await this.hotelPerformanceRepository.replaceById(id, hotelPerformance);
  }

  @del('/hotel-performances/{id}')
  @response(204, {
    description: 'HotelPerformance DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.hotelPerformanceRepository.deleteById(id);
  }
}
