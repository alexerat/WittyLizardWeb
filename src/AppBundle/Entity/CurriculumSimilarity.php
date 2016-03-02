<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * CurriculumSimilarity
 *
 * @ORM\Table(name="Tutoring.Curriculum_Similarity", uniqueConstraints={@ORM\UniqueConstraint(name="Curriculum_1_UNIQUE", columns={"Curriculum_1"}), @ORM\UniqueConstraint(name="Curriculum_2_UNIQUE", columns={"Curriculum_2"})}, indexes={@ORM\Index(name="fk_Curriculum_Similarity_Curriculum_Table1_idx", columns={"Curriculum_Table1"}), @ORM\Index(name="fk_Curriculum_Similarity_Curriculum_Table2_idx", columns={"Curriculum_Table2"})})
 * @ORM\Entity
 */
class CurriculumSimilarity
{
    /**
     * @var \AppBundle\Entity\CurriculumTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\CurriculumTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Curriculum_ID", referencedColumnName="Curriculum_ID")
     * })
     */
    protected $currId1;

    /**
     * @var \AppBundle\Entity\CurriculumTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\CurriculumTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Curriculum_ID", referencedColumnName="Curriculum_ID")
     * })
     */
    protected $currId2;

    /**
     * @var \AppBundle\Entity\CurriculumTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\CurriculumTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Curriculum_ID", referencedColumnName="Curriculum_ID")
     * })
     */
    protected $affinity;

    /**
     * Set currId1
     *
     * @param \AppBundle\Entity\CurriculumTable $currId1
     *
     * @return CurriculumSimilarity
     */
    public function setCurrId1(\AppBundle\Entity\CurriculumTable $currId1 = null)
    {
        $this->currId1 = $currId1;

        return $this;
    }

    /**
     * Get currId1
     *
     * @return \AppBundle\Entity\CurriculumTable
     */
    public function getCurrId1()
    {
        return $this->currId1;
    }

    /**
     * Set currId2
     *
     * @param \AppBundle\Entity\CurriculumTable $currId2
     *
     * @return CurriculumSimilarity
     */
    public function setCurrId2(\AppBundle\Entity\CurriculumTable $currId2 = null)
    {
        $this->currId2 = $currId2;

        return $this;
    }

    /**
     * Get currId2
     *
     * @return \AppBundle\Entity\CurriculumTable
     */
    public function getCurrId2()
    {
        return $this->currId2;
    }

    /**
     * Set affinity
     *
     * @param \AppBundle\Entity\CurriculumTable $affinity
     *
     * @return CurriculumSimilarity
     */
    public function setAffinity(\AppBundle\Entity\CurriculumTable $affinity = null)
    {
        $this->affinity = $affinity;

        return $this;
    }

    /**
     * Get affinity
     *
     * @return \AppBundle\Entity\CurriculumTable
     */
    public function getAffinity()
    {
        return $this->affinity;
    }
}
