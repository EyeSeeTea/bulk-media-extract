import { ProgramD2Repository } from "./data/repositories/ProgramD2Repository";
import { ProgramTestRepository } from "./data/repositories/ProgramTestRepository";
import { UserD2Repository } from "./data/repositories/UserD2Repository";
import { UserTestRepository } from "./data/repositories/UserTestRepository";
import { ProgramRepository } from "./domain/repositories/ProgramRepository";
import { UserRepository } from "./domain/repositories/UserRepository";
import { GetFileCapableProgramsUseCase } from "./domain/usecases/GetFileCapableProgramsUseCase";
import { GetCurrentUserUseCase } from "./domain/usecases/GetCurrentUserUseCase";
import { GetOrganisationUnitsUseCase } from "./domain/usecases/GetOrganisationUnitsUseCase";
import { GetProgramEventsPreviewUseCase } from "./domain/usecases/GetProgramEventsPreviewUseCase";
import { GetProgramFilePropertiesUseCase } from "./domain/usecases/GetProgramFilePropertiesUseCase";
import { D2Api } from "./types/d2-api";

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

type Repositories = {
    userRepository: UserRepository;
    programRepository: ProgramRepository;
};

function getCompositionRoot(repositories: Repositories) {
    return {
        users: {
            getCurrent: new GetCurrentUserUseCase(repositories),
        },
        programs: {
            getFileCapable: new GetFileCapableProgramsUseCase(repositories),
            getFileProperties: new GetProgramFilePropertiesUseCase(repositories),
            getEventsPreview: new GetProgramEventsPreviewUseCase(repositories),
            getOrganisationUnits: new GetOrganisationUnitsUseCase(repositories),
        },
    };
}

export function getWebappCompositionRoot(api: D2Api) {
    const repositories: Repositories = {
        userRepository: new UserD2Repository(api),
        programRepository: new ProgramD2Repository(api),
    };

    return getCompositionRoot(repositories);
}

export function getTestCompositionRoot() {
    const repositories: Repositories = {
        userRepository: new UserTestRepository(),
        programRepository: new ProgramTestRepository(),
    };

    return getCompositionRoot(repositories);
}
