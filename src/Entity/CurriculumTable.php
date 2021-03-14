<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * CurriculumTable
 *
 * @ORM\Table(name="Tutoring.CurriculumTable", uniqueConstraints={@ORM\UniqueConstraint(name="Curriculum_ID_UNIQUE", columns={"Curriculum_ID"})})
 * @ORM\Entity
 */
class CurriculumTable
{
    /**
     * @var integer
     *
     * @ORM\Column(name="Curriculum_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
    */
    private $currId;

    /**
     * @var string
     *
     * @ORM\Column(name="Description", type="string", length=45)
    */
    private $desc;


    /**
     * Get currId
     *
     * @return integer
     */
    public function getCurrId()
    {
        return $this->currId;
    }

    /**
     * Set desc
     *
     * @param string $desc
     *
     * @return CurriculumTable
     */
    public function setDesc($desc)
    {
        $this->desc = $desc;

        return $this;
    }

    /**
     * Get desc
     *
     * @return string
     */
    public function getDesc()
    {
        return $this->desc;
    }
}
