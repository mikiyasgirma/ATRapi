import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Hotel, HotelPerformance} from '../models';
import {HotelRepository} from '../repositories';

type ComputedHotelPerformance = HotelPerformance & {
  adr: number;
  revPar: number;
};

export class HotelHotelPerformanceController {
  constructor(
    @repository(HotelRepository) protected hotelRepository: HotelRepository,
  ) {}

  @get('/api/hotels/{id}/hotel-performances', {
    responses: {
      '200': {
        description: 'Array of Hotel has many HotelPerformance',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(HotelPerformance)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: string,
    @param.query.object('filter') filter?: Filter<HotelPerformance>,
  ): Promise<ComputedHotelPerformance[]> {
    // Fetch hotel performances
    const hotelPerformances = await this.hotelRepository
      .hotelPerformances(id)
      .find(filter);

    // Compute additional fields
    const computedHotelData = hotelPerformances.map(record => {
      // Check for division by zero
      const adr =
        record.sold_rooms !== 0 ? record.revenue / record.sold_rooms : 0;
      const revPar =
        record.availableRooms !== 0
          ? record.revenue / record.availableRooms
          : 0;

      return {
        ...record,
        adr,
        revPar,
      } as ComputedHotelPerformance;
    });

    return computedHotelData;
  }

  @post('/api/hotels/{id}/hotel-performances', {
    responses: {
      '200': {
        description: 'Hotel model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(HotelPerformance)},
        },
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Hotel.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(HotelPerformance, {
            title: 'NewHotelPerformanceInHotel',
            exclude: ['id'],
            optional: ['hotelId'],
          }),
        },
      },
    })
    hotelPerformance: Omit<HotelPerformance, 'id'>,
  ): Promise<HotelPerformance> {
    return this.hotelRepository.hotelPerformances(id).create(hotelPerformance);
  }

  @patch('/api/hotels/{id}/hotel-performances', {
    responses: {
      '200': {
        description: 'Hotel.HotelPerformance PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(HotelPerformance, {partial: true}),
        },
      },
    })
    hotelPerformance: Partial<HotelPerformance>,
    @param.query.object('where', getWhereSchemaFor(HotelPerformance))
    where?: Where<HotelPerformance>,
  ): Promise<Count> {
    return this.hotelRepository
      .hotelPerformances(id)
      .patch(hotelPerformance, where);
  }

  @del('/api/hotels/{id}/hotel-performances', {
    responses: {
      '200': {
        description: 'Hotel.HotelPerformance DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: string,
    @param.query.object('where', getWhereSchemaFor(HotelPerformance))
    where?: Where<HotelPerformance>,
  ): Promise<Count> {
    return this.hotelRepository.hotelPerformances(id).delete(where);
  }

  @get('/api/hotels/{hotel_id}/adr', {
    responses: {
      '200': {
        description: 'ADR for a hotel',
        content: {
          'application/json': {
            schema: {type: 'number'},
          },
        },
      },
    },
  })
  async getHotelAdr(
    @param.path.number('hotel_id') hotelId: string,
  ): Promise<number> {
    const performances = await this.hotelRepository
      .hotelPerformances(hotelId)
      .find();
    const totalRevenue = performances.reduce(
      (acc, perf) => acc + perf.revenue,
      0,
    );
    const totalSoldRooms = performances.reduce(
      (acc, perf) => acc + perf.sold_rooms,
      0,
    );
    return totalSoldRooms ? totalRevenue / totalSoldRooms : 0;
  }

  @get('/api/hotels/{hotel_id}/revpar', {
    responses: {
      '200': {
        description: 'RevPAR for a hotel',
        content: {
          'application/json': {
            schema: {type: 'number'},
          },
        },
      },
    },
  })
  async getHotelRevPar(
    @param.path.number('hotel_id') hotelId: string,
  ): Promise<number> {
    const performances = await this.hotelRepository
      .hotelPerformances(hotelId)
      .find();
    const totalRevenue = performances.reduce(
      (acc, perf) => acc + perf.revenue,
      0,
    );
    const totalAvailableRooms = performances.reduce(
      (acc, perf) => acc + perf.availableRooms,
      0,
    );
    return totalAvailableRooms ? totalRevenue / totalAvailableRooms : 0;
  }

  @get('/api/hotels/{hotel_id}/occupancy-rate', {
    responses: {
      '200': {
        description: 'Occupancy rate for a hotel',
        content: {
          'application/json': {
            schema: {type: 'number'},
          },
        },
      },
    },
  })
  async getHotelOccupancyRate(
    @param.path.number('hotel_id') hotelId: string,
  ): Promise<number> {
    const performances = await this.hotelRepository
      .hotelPerformances(hotelId)
      .find();
    const totalSoldRooms = performances.reduce(
      (acc, perf) => acc + perf.sold_rooms,
      0,
    );
    const totalAvailableRooms = performances.reduce(
      (acc, perf) => acc + perf.availableRooms,
      0,
    );
    return totalAvailableRooms ? totalSoldRooms / totalAvailableRooms : 0;
  }

  @get('/api/hotels/rankings/revpar', {
    responses: {
      '200': {
        description: 'Array of hotels ranked by RevPAR',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Object}},
          },
        },
      },
    },
  })
  async getHotelRankingsByRevPar(): Promise<any> {
    const hotels = await this.hotelRepository.find({
      include: [{relation: 'hotelPerformances'}],
    });

    console.log('hotels', hotels);

    const rankings = hotels.map(hotel => {
      const totalRevenue = hotel.hotelPerformances?.reduce(
        (acc, perf) => acc + perf.revenue,
        0,
      );
      const totalAvailableRooms = hotel.hotelPerformances?.reduce(
        (acc, perf) => acc + perf.availableRooms,
        0,
      );
      const revPar = totalAvailableRooms
        ? totalRevenue / totalAvailableRooms
        : 0;
      return {...hotel, revPar};
    });

    rankings.sort((a, b) => b.revPar - a.revPar);
    return rankings;
  }

  @get('/api/hotels/rankings/occupancy-rate', {
    responses: {
      '200': {
        description: 'Array of hotels ranked by Occupancy Rate',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Object}},
          },
        },
      },
    },
  })
  async getHotelRankingsByOccupancyRate(): Promise<any> {
    const hotels = await this.hotelRepository.find({
      include: [{relation: 'hotelPerformances'}],
    });

    const rankings = hotels.map(hotel => {
      const totalSoldRooms = hotel.hotelPerformances?.reduce(
        (acc, perf) => acc + perf.sold_rooms,
        0,
      );
      const totalAvailableRooms = hotel.hotelPerformances?.reduce(
        (acc, perf) => acc + perf.availableRooms,
        0,
      );
      const occupancyRate = totalAvailableRooms
        ? totalSoldRooms / totalAvailableRooms
        : 0;
      return {...hotel, occupancyRate};
    });

    rankings.sort((a, b) => b.occupancyRate - a.occupancyRate);
    return rankings;
  }

  @get('/api/hotels/rankings/adr', {
    responses: {
      '200': {
        description: 'Array of hotels ranked by ADR',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Object}},
          },
        },
      },
    },
  })
  async getHotelRankingsByAdr(): Promise<any> {
    const hotels = await this.hotelRepository.find({
      include: [{relation: 'hotelPerformances'}],
    });

    const rankings = hotels.map(hotel => {
      const totalRevenue = hotel.hotelPerformances?.reduce(
        (acc, perf) => acc + perf.revenue,
        0,
      );
      const totalSoldRooms = hotel.hotelPerformances?.reduce(
        (acc, perf) => acc + perf.sold_rooms,
        0,
      );
      const adr = totalSoldRooms ? totalRevenue / totalSoldRooms : 0;
      return {...hotel, adr};
    });

    rankings.sort((a, b) => b.adr - a.adr);
    return rankings;
  }

  @get('/api/hotels/{hotel_id}/rank/revpar', {
    responses: {
      '200': {
        description: 'Ranking of a single hotel by RevPAR',
        content: {
          'application/json': {
            schema: {type: 'number'},
          },
        },
      },
    },
  })
  async getHotelRankingByRevPar(
    @param.path.number('hotel_id') hotelId: string,
  ): Promise<number> {
    const hotels = await this.getHotelRankingsByRevPar();
    const ranking = hotels.findIndex((hotel: any) => hotel.id == hotelId);
    return ranking >= 0 ? ranking + 1 : -1; // +1 to convert to 1-based index
  }

  @get('/api/hotels/{hotel_id}/rank/occupancy-rate', {
    responses: {
      '200': {
        description: 'Ranking of a single hotel by Occupancy Rate',
        content: {
          'application/json': {
            schema: {type: 'number'},
          },
        },
      },
    },
  })
  async getHotelRankingByOccupancyRate(
    @param.path.number('hotel_id') hotelId: string,
  ): Promise<number> {
    const hotels = await this.getHotelRankingsByOccupancyRate();
    const ranking = hotels.findIndex((hotel: any) => hotel.id == hotelId);
    return ranking >= 0 ? ranking + 1 : -1; // +1 to convert to 1-based index
  }

  @get('/api/hotels/{hotel_id}/rank/adr', {
    responses: {
      '200': {
        description: 'Ranking of a single hotel by ADR',
        content: {
          'application/json': {
            schema: {type: 'number'},
          },
        },
      },
    },
  })
  async getHotelRankingByAdr(
    @param.path.number('hotel_id') hotelId: string,
  ): Promise<number> {
    const hotels = await this.getHotelRankingsByAdr();
    const ranking = hotels.findIndex((hotel: any) => hotel.id == hotelId);
    return ranking >= 0 ? ranking + 1 : -1; // +1 to convert to 1-based index
  }

  @get('/api/hotels/{hotel_id}/rankings', {
    responses: {
      '200': {
        description:
          'Ranking of a single hotel by RevPAR, Occupancy Rate, and ADR',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                revParRank: {type: 'number'},
                occupancyRateRank: {type: 'number'},
                adrRank: {type: 'number'},
              },
            },
          },
        },
      },
    },
  })
  async getHotelRankings(
    @param.path.number('hotel_id') hotelId: string,
  ): Promise<{
    revParRank: number;
    occupancyRateRank: number;
    adrRank: number;
    poolSize: number;
  }> {
    const revParRank = await this.getHotelRankingByRevPar(hotelId);
    const occupancyRateRank =
      await this.getHotelRankingByOccupancyRate(hotelId);
    const adrRank = await this.getHotelRankingByAdr(hotelId);

    const hotels = await this.hotelRepository.find();
    const poolSize = hotels.length;

    return {
      revParRank,
      occupancyRateRank,
      adrRank,
      poolSize,
    };
  }
}
